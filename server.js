//Port
const port = 3000;

//Importation de modules NPM

const express = require('express');
const ejs = require('ejs');
const app = express();
const cors = require('cors');
const {Client} = require('pg');
const fs = require('fs');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const token = require("random-token");
const nodemailer = require("nodemailer");
const fsExtra = require('fs-extra');
const securedConnect = require("connect-ensure-login");
const LocalStrategy = require("passport-local").Strategy;

//const initializePassport = require("./passportConfig");


//Initialisation des modules
//initializePassport(passport);
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static('public'));
app.set('view engine','ejs')
app.use(cors({
    origin:'*'
}));
app.use(
    session({
      secret: process.env.MY_SECRET,
      resave: false,
      saveUninitialized: false
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  //app.use(flash());
  

//Connexion à la base de donnée postgreSql

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
        ca: fs.readFileSync('eu-north-1-bundle.pem').toString()
      }
});
client.connect();
// Se connecter à une deuxième base de donnees

passport.use('local', new LocalStrategy({passReqToCallBack: true},( email, mp, cb )=> {
    console.log("this is being executed");
    client.query("SELECT nom, email, mp from utilisateurs where email=$1", [email], (err, result) => {
        if(err){
            return cb(err);

        }
        if(result.rows.length > 0){
            const first = result.rows[0];
            bcrypt.compare(mp, first.mp, (err, res) => {
                if(res){
                    cb(null, {
                        email: first.email,
                        nom: first.nom
                    })
                }
                else {
                    cb(null, false);
                }
            })
        }
        else {
            cb(null, false);
        }
    })
}));

passport.serializeUser(function(user, done){
    console.log("serialize user is executing")
    done(null, user.email);
})

passport.deserializeUser(function(email, done){
    client.query('SELECT nom, email FROM utilisateurs WHERE email = $1', [email], (err, results) => {
        if(err) {
          return done(err)
        }

        done(null, results.rows[0])
      });
});

//ST_AsGeoJSON(ST_Transform(geom,4326)) as donnee





//Diffusion donnees Kobo
let control = [];
setInterval(async()=>{
        const reponse = await fetch('https://kc.kobotoolbox.org/api/v1/data/2250270',{
            method: 'GET',
            headers: new Headers ({
                'Authorization' : 'Token e4a7e61378822315f861035e55a0450e75f21a49'
            })
    });
        const don = await reponse.json();
        control.push(don);
    },1000);

app.use(express.static('public'));
app.set('view engine','ejs');


app.get('/',(req,res)=>{
    res.json(control[0]);
    control=[];
    console.log()
});

app.get('/dashboard',(req,res)=>{
    res.render('page_accueil');
});
app.get('/stats',(req,res)=>{
    res.render('stats');
});
app.get('/fiche',(req,res)=>{
    res.render('table');
});
app.get('/statistiques',(req,res)=>{
    res.render('ch_stats');
});

app.get('/connexion',securedConnect.ensureLoggedOut({redirectTo:'/page'}),(req,res)=>{
    res.render('connexion');
});
app.get('/inscription',securedConnect.ensureLoggedOut({redirectTo:'/page'}),(req,res)=>{
    res.render('inscription');
});
//let page=token(20);

let donnee_connect=[]


app.get(`/page`,securedConnect.ensureLoggedIn({redirectTo:'/connexion'}),(req,res)=>{
    result.length=0;
    res.render('dashboard_conn');
    
});


app.get('/valid/:tokenGen',(req,res)=>{
    client.query(
        `SELECT * FROM utilisateur
            WHERE token like '${req.params.tokenGen}'`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                res.render('validation.ejs',{
                    tokenGen : req.params.tokenGen
                });
                console.log(results.rows);           
            }
        });
});

app.post('/reinit',(req,res)=>{
    result.length=0;
    res.redirect('/page');
});

app.post("/validation/:tokenGen",(req,res)=>{
    let aleaToken = req.params.tokenGen;
    console.log(aleaToken);
    client.query(
        `SELECT * FROM utilisateur
        WHERE token like '${aleaToken}'`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                console.log(results.rows);
                let { prenom, nom,email,contact,matricule,ugf, mp,token } = results.rows[0];
                client.query(
                    `SELECT * FROM utilisateurs
                        WHERE email = $1`,
                    [email],
                    (err, response) => {
                        if (err) {
                        console.log(err);
                        }else{
                            console.log(response.rows);           
                            if (response.rows.length > 0) {
                                res.redirect("/inscription");
                                console.log("Email existe deja dans la base de données");
                        
                            } else {
                           
                            client.query(
                                `INSERT INTO utilisateurs (prenom,nom,email,contact,matricule,ugf,mp,token)
                                    VALUES ($1, $2, $3,$4,$5,$6,$7,$8)
                                    RETURNING *`,
                                [prenom,nom,email,contact,matricule,ugf,mp,token],
                                (err, result) => {
                                if (err) {
                                    console.log(err);
                                }else{
            
                                //-----------------------------------------
                                var transporteur = nodemailer.createTransport({
                                    service : "gmail",
                                    auth:{
                                        user :"alphacodant@gmail.com",
                                        pass :process.env.PWD
                                    }
                                });
                                var mailOptions={
                                    from :"alphacodant@gmail.com",
                                    to :results.rows[0].email ,
                                    subject : `Reponse à la demande d'autorisation d'accès à la l'Application WebSig`,
                                    text: `Bonjour M. (Mme) ${results.rows[0].prenom} ${results.rows[0].nom}, votre demande d'accès à la carte interactive vient d'être acceptée. Vous pouvez vous connecter avec votre addresse emeil et votre mot de pass.\n vous pouvez vous connecter ici : http://localhost:3000/connexion`
                                };
                                transporteur.sendMail(mailOptions,(err,response)=>{
                                    if(err){
                                        console.log("Erreur d'envoi du mail "+err);
                                    }else{
                                        console.log("Mail envoyé avec succès !");
                                        res.redirect('connexion');
                                    };
                                });
                                
                                //-----------------------------------------
                                 
                                console.log(results.rows);
                                console.log("Succès Vous êtes inscris, vous pouvez vous connecter");
                                res.redirect("/connexion");
                                }
                                }
                            );
                            }
                        }   
                    }
                    );
            }
        });
    //---------------------!°°°!------------------------------
    
    //---------------------!°°°!------------------------------


    
});

app.post("/inscription",securedConnect.ensureLoggedOut({redirectTo:'/page'}),(req,res)=>{
    console.log(donnee_connect[donnee_connect.length-1])
    let { prenom, nom,email,contact,mat,ugf, mp, rp_mp } = req.body;
    
    let errors = [];
    
    console.log({
        prenom, nom,email,contact, mp, rp_mp
    });
    
    if (!nom ||!prenom || !email ||!contact || !mp || !rp_mp) {
        errors.push({ message: "Veillez entrer une valeur" });
    }
    
    if (mp.length < 8) {
        errors.push({ message: "Le mot de pass doit avoir au moins 8 charactères" });
    }
    
    if (mp !== rp_mp) {
        errors.push({ message: "Les mots de pass ne sont pas concordants" });
    }
    if (errors.length > 0) {
        res.render("inscription", { errors, nom,prenom, email,contact, mp, rp_mp });
    } else {
        bcrypt.hash(mp,10,(err,hash)=>{
            if(err){
                console.log(err);
            }else{

                console.log(hash);
        // Validation passed
        client.query(
        `SELECT * FROM utilisateur
            WHERE email = $1`,
        [email],
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                console.log(results.rows);           
                if (results.rows.length > 0) {
                    res.redirect("/inscription");
                    console.log("Email existe deja dans la base de données");
            
                } else {
                var tokenGen = token(16);
                client.query(
                    `INSERT INTO utilisateur (prenom,nom,email,contact,matricule,ugf,mp,token)
                        VALUES ($1, $2, $3,$4,$5,$6,$7,$8)
                        RETURNING *`,
                    [prenom,nom,email,contact,mat,ugf,hash,tokenGen],
                    (err, results) => {
                    if (err) {
                        console.log(err);
                    }else{

                    //-----------------------------------------
                        var transporteur = nodemailer.createTransport({
                            service : "gmail",
                            auth:{
                                user :"alphacodant@gmail.com",
                                pass :process.env.PWD
                            }
                        });
                        var mailOptions={
                            from :"alphacodant@gmail.com",
                            to :"djobianicethugue@gmail.com" ,
                            subject : `Demande d'autorisation d'accès à la l'Application WebSig de ${nom} ${prenom}`,
                            text : `M.(Mme) ${nom} ${prenom} de matricule ${mat} en service à l'Unité de Gestion Forestière de ${ugf} joignable au ${contact} ou par email via ${email} souhaiterait avoir l'accès à la plateforme WebSig du centre de Gestion. Veillez cliquer sur ce lien pour valider sa demande.\n http://localhost:${port}/valid/`+tokenGen
                        };
                        transporteur.sendMail(mailOptions,(err,response)=>{
                            if(err){
                                console.log("Erreur d'envoi du mail "+err);
                            }else{
                                console.log("Mail envoyé avec succès !");                               
                            };
                        });
                    
                    //-----------------------------------------
                     
                    console.log(results.rows);
                    console.log("Succès Vous avez validé l'accès");
                    res.redirect("/connexion");
                    }
                    }
                );
                }
            }   
        }
        );

            }
        });
        
    }
});
let liste_token=[];
app.post("/connexion",securedConnect.ensureLoggedOut({redirectTo:'/page'}),(req,res)=>{
    //donnee_connect.length=0;

    client.query("SELECT nom, email, mp from utilisateurs where email=$1", [req.body.email], (err, result) => {
        if(err){
            return cb(err);

        }
        if(result.rows.length > 0){
            var usery = {
                email : result.rows[0].email,
                mp : result.rows[0].mp
            };
            req.login(usery,(err)=>{
                if(err){
                    console.log("Erreur de connexion: "+err);
                }else{
                    passport.authenticate('local', function(err, user, info){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(user);
                            res.redirect('/page');
                        }
                        
                    })(req, res);
                }
            });
        }
    });
 });

 app.get("/log/deconnecter",(req,res)=>{
    req.logout((err)=>{
        if (err){
            console.log(err);
        }else{
            liste_token.length=0;
            res.redirect("/connexion");
        }
    });
});
let liste_element = [];
let result = [];
let donn_ref_requete=[];

app.post('/requete',(req)=>{
    donn_ref_requete.length=0;
    result.length=0;
    var corresp = {"tene":1,"sangoue":2};
    var ddf = '(';
    for(let xl=0;xl<liste_element.length;xl++){
        if(xl<liste_element.length-1){
            ddf+=`${corresp[liste_element[xl]]},`;
        }else if (xl==liste_element.length-1){
            ddf+=`${corresp[liste_element[xl]]})`;
        }
    }
    console.log(ddf);
    let {cocher,cocher2,cocher3,cocher4,cocher5,attributes,attributes2,attributes3,attributes4,attributes5,operator,operator2,operator3,operator4,operator5,
        value,value2,value3,value4,value5
    }=req.body;
    console.log(attributes2);

    if (cocher && cocher2 && cocher3 && cocher4 &&cocher5){
        if(operator=='ilike' || operator=='not ilike'){
            value=`'${value}%'`;
        }else{
            value=value;
        }
        if(operator2=='ilike' || operator2=='not ilike'){
            value2=`'${value2}%'`;
        }else{
            value2=value2;
        }
        if(operator3=='ilike' || operator3=='not ilike'){
            value3=`'${value3}%'`;
        }else{
            value3=value3;
        }
        if(operator4=='ilike' || operator4=='not ilike'){
            value4=`'${value4}%'`;
        }else{
            value4=value4;
        }
        if(operator5=='ilike' || operator5=='not ilike'){
            value5=`'${value5}%'`;
        }else{
            value5=value5;
        }
        let clause1 = 'AND';
        if (attributes==attributes2){
            clause1='OR';
        }else{
            clause1='AND';
        }
        let clause2 = 'AND';
        if (attributes2==attributes3){
            clause2='OR';
        }else{
            clause2='AND';
        }
        let clause3 = 'AND';
        if (attributes3==attributes4){
            clause3='OR';
        }else{
            clause3='AND';
        }
        let clause4 = 'AND';
        if (attributes4==attributes5){
            clause4='OR';
        }else{
            clause4='AND';
        }
        client.query(`SELECT json_build_object('type', 'FeatureCollection','features',json_agg(ST_AsGeoJSON(t.*)::json) ) as donnee 
            FROM (SELECT a.id,a.numero,a.essence,a.superficie,a.partenaire,b.nom,a.latitude,a.longitude,a.densite,ST_Transform(geom, 4326) 
            FROM public.parcelles a  JOIN public.foret b ON a.foret=b.id 
            WHERE a.foret in ${ddf} 
            and ${attributes} ${operator} ${value} ${clause1} ${attributes2} ${operator2} ${value2} ${clause2} ${attributes3} ${operator3} ${value3} 
            ${clause3} ${attributes4} ${operator4} ${value4} ${clause4} ${attributes5} ${operator5} ${value5}) AS t`,
                (err,results)=>{
                if(!err){
                    result.push(results.rows[0].donnee);
                    console.log(results.rows[0].donnee);
                    /*fs.writeFile(`public/json/fichier.geojson`,JSON.stringify(results.rows[0].donnee),'utf-8',(err)=>{
                        console.log(err);               
                        });*/
                    
                }else{
                    console.log(err);
                }
                client.end;
            });
    }else if (cocher && cocher2 && cocher3 && cocher4){
        if(operator=='ilike' || operator=='not ilike'){
            value=`'${value}%'`;
        }else{
            value=value;
        }
        if(operator2=='ilike' || operator2=='not ilike'){
            value2=`'${value2}%'`;
        }else{
            value2=value2;
        }
        if(operator3=='ilike' || operator3=='not ilike'){
            value3=`'${value3}%'`;
        }else{
            value3=value3;
        }
        if(operator4=='ilike' || operator4=='not ilike'){
            value4=`'${value4}%'`;
        }else{
            value4=value4;
        }
        let clause1 = 'AND';
        if (attributes==attributes2){
            clause1='OR';
        }else{
            clause1='AND';
        }
        let clause2 = 'AND';
        if (attributes2==attributes3){
            clause2='OR';
        }else{
            clause2='AND';
        }
        let clause3 = 'AND';
        if (attributes3==attributes4){
            clause3='OR';
        }else{
            clause3='AND';
        }
        client.query(`SELECT json_build_object('type', 'FeatureCollection','features',json_agg(ST_AsGeoJSON(t.*)::json) ) as donnee 
            FROM (SELECT a.id,a.numero,a.essence,a.superficie,a.partenaire,b.nom,a.latitude,a.longitude,a.densite,ST_Transform(geom, 4326) 
            FROM public.parcelles a  JOIN public.foret b ON a.foret=b.id 
            WHERE a.foret in ${ddf}
            and ${attributes} ${operator} ${value} ${clause1} ${attributes2} ${operator2} ${value2} ${clause2} ${attributes3} ${operator3} ${value3} 
            ${clause3} ${attributes4} ${operator4} ${value4}) AS t`,
                (err,results)=>{
                if(!err){
                    result.push(results.rows[0].donnee);
                    console.log(results.rows[0].donnee);
                    /*fs.writeFile(`public/json/fichier.geojson`,JSON.stringify(results.rows[0].donnee),'utf-8',(err)=>{
                        console.log(err);               
                        });*/
                    
                }else{
                    console.log(err);
                }
                client.end;
            });
    }else if (cocher && cocher2 && cocher3){
        if(operator=='ilike' || operator=='not ilike'){
            value=`'${value}%'`;
        }else{
            value=value;
        }
        if(operator2=='ilike' || operator2=='not ilike'){
            value2=`'${value2}%'`;
        }else{
            value2=value2;
        }
        if(operator3=='ilike' || operator3=='not ilike'){
            value3=`'${value3}%'`;
        }else{
            value3=value3;
        }
        let clause1 = 'AND';
        if (attributes==attributes2){
            clause1='OR';
        }else{
            clause1='AND';
        }
        let clause2 = 'AND';
        if (attributes2==attributes3){
            clause2='OR';
        }else{
            clause2='AND';
        }
        client.query(`SELECT json_build_object('type', 'FeatureCollection','features',json_agg(ST_AsGeoJSON(t.*)::json) ) as donnee 
            FROM (SELECT a.id,a.numero,a.essence,a.superficie,a.partenaire,b.nom,a.latitude,a.longitude,a.densite,ST_Transform(geom, 4326) 
            FROM public.parcelles a  JOIN public.foret b ON a.foret=b.id 
            WHERE a.foret in ${ddf}
            and ${attributes} ${operator} ${value} ${clause1} ${attributes2} ${operator2} ${value2} ${clause2} ${attributes3} ${operator3} ${value3}) AS t`,
                (err,results)=>{
                if(!err){
                    result.push(results.rows[0].donnee);
                    console.log(results.rows[0].donnee);
                    /*fs.writeFile(`public/json/fichier.geojson`,JSON.stringify(results.rows[0].donnee),'utf-8',(err)=>{
                        console.log(err);               
                        });*/
                    
                }else{
                    console.log(err);
                }
                client.end;
            });
    }else if (cocher && cocher2){
        
        if(operator=='ilike' || operator=='not ilike'){
            value=`'${value}%'`;
        }else{
            value=value;
        }
        if(operator2=='ilike' || operator2=='not ilike'){
            value2=`'${value2}%'`;
        }else{
            value2=value2;
        }
        let clause = 'et';
        if (attributes==attributes2){
            clause='OR';
        }else{
            clause='AND';
        }
        client.query(`SELECT json_build_object('type', 'FeatureCollection','features',json_agg(ST_AsGeoJSON(t.*)::json) ) as donnee 
            FROM (SELECT a.id,a.numero,a.essence,a.superficie,a.partenaire,b.nom,a.latitude,a.longitude,a.densite,ST_Transform(geom, 4326) 
            FROM public.parcelles a  JOIN public.foret b ON a.foret=b.id 
            WHERE a.foret in ${ddf} 
            and ${attributes} ${operator} ${value} ${clause} ${attributes2} ${operator2} ${value2}) AS t`,
                (err,results)=>{
                if(!err){
                    result.push(results.rows[0].donnee);
                    console.log(results.rows[0].donnee);
                    /*fs.writeFile(`public/json/fichier.geojson`,JSON.stringify(results.rows[0].donnee),'utf-8',(err)=>{
                        console.log(err);               
                        });*/
                    
                }else{
                    console.log(err);
                }
                client.end;
            });
    }else if (cocher){
        if(operator=='ilike' || operator=='not ilike'){
            value=`'${value}%'`;
        }else{
            value=value;
        }
        client.query(`SELECT json_build_object('type', 'FeatureCollection','features',json_agg(ST_AsGeoJSON(t.*)::json) ) as donnee 
            FROM (SELECT a.id,a.numero,a.essence,a.superficie,a.partenaire,b.nom,a.latitude,a.longitude,a.densite,ST_Transform(geom, 4326) 
            FROM public.parcelles a  JOIN public.foret b ON a.foret=b.id 
            WHERE a.foret in ${ddf} 
            and ${attributes} ${operator} ${value}) AS t`,(err,results)=>{
                if(!err){
                    //donn_ref_requete.push("element");
                    result.push(results.rows[0].donnee);
                    console.log(results.rows[0].donnee);
                    /*fs.writeFile(`public/json/fichier.geojson`,JSON.stringify(results.rows[0].donnee),'utf-8',(err)=>{
                        console.log(err);               
                        });*/
                    
                }else{
                    console.log(err);
                }
                client.end;
            });
    }
    
    console.log(donn_ref_requete);
    console.log(operator);
    console.log(attributes);
    console.log(value);
    //res.send("Salut");
    //res.end();
    //res.redirect('/page')
})

app.post('/dashboard/00000',(req,res)=>{
    //result.length=0;
    liste_token.length=0
    var corresp = {"tene":1,"sangoue":2};
    
    /*fsExtra.emptyDirSync('public/json');
    if(count.length>0){
        count.length=0;
    }*/
    let tout_ugf = req.body.tout_ugf;
    let ugf_tene = req.body.ugf_tene;
    let ugf_sangoue = req.body.ugf_sangoue;
    let liste_var = [tout_ugf,ugf_sangoue,ugf_tene];
    
    liste_element;
    let liste_choix='';
    
    if(liste_var[0]){
        liste_choix+=liste_var[0];
        liste_element.push(liste_var[0]);
    }else{
        for (let i=0;i<liste_var.length;i++){
            if(liste_var[i]){
                if(i==liste_var.length-1){
                    liste_choix+=liste_var[i];
                }else{
                    liste_choix+=liste_var[i]+",";
                }
                //liste_element.push(liste_var[i]);
            };
            
        }
        
    }
    if(liste_choix==''){
        console.log("Ok");
    }else{
        result.length=0;
        liste_element.length=0;
        for (let i=0;i<liste_var.length;i++){
            if(liste_var[i]){
                
                liste_element.push(liste_var[i]);
            };
            
        }
    }   
    var ddf = '(';
    for(let xl=0;xl<liste_element.length;xl++){
        if(xl<liste_element.length-1){
            ddf+=`${corresp[liste_element[xl]]},`;
        }else if (xl==liste_element.length-1){
            ddf+=`${corresp[liste_element[xl]]})`;
        }
    }
    console.log(ddf);
    client.query(`SELECT json_build_object('type', 'FeatureCollection','features',json_agg(ST_AsGeoJSON(t.*)::json) ) as donnee 
        FROM (SELECT a.id,a.numero,a.essence,a.superficie,a.partenaire,b.nom,a.latitude,a.longitude,a.densite,ST_Transform(geom, 4326)
        FROM public.parcelles a  JOIN public.foret b ON a.foret=b.id WHERE a.foret in ${ddf}) AS t`,
                (err,results)=>{
                if(!err){
                    result.push(results.rows[0].donnee);
                    console.log(results.rows[0].donnee);
                    fs.writeFile(`public/json/fichier.geojson`,JSON.stringify(results.rows[0].donnee),'utf-8',(err)=>{
                        console.log(err);               
                        });
                    
                }else{
                    console.log(err);
                }
                client.end;
            });
    console.log(liste_choix);
    //tokenGen=liste_token[liste_token.length-1];
    //res.redirect('/page');
    /*if (tout_ugf.checked==true){
        nom_ugf=tout_ugf;
    }else{

    }*/
    //console.log(tout_ugf);
    //liste_element.length=0;
    let tokenT = token(10);
    liste_token.push(tokenT);
    //res.status(200);
});

app.get('/elements/elem',(req,res)=>{
    res.send(result[0]);
    //liste_element=[];
})
app.get('/elements/token',(req,res)=>{
    res.send(liste_token[liste_token.length-1]);
    //liste_element=[];
})
app.get('/elements/requetes',(req,res)=>{
    res.send(donn_ref_requete);
    //liste_element=[];
})
app.get('/elements/element',(req,res)=>{
    res.send(liste_element);
    //liste_element=[];
})

//Afficher les choix
app.get('/elem',(req,res)=>{
    res.render('base');
})

app.get('/fiche',(req,res)=>{
    res.render('table');
})
let count=[];
app.post('/dashboard/filtre',(req,res)=>{
    if(count.length>0){
        count.length=0;
    }
    count.push(1);
    res.redirect('/page');
    
})

app.get('/iteration',(req,res)=>{
    res.send(count);
})



 app.listen(port,()=>{
    console.log("Serveur en marche sur le port "+port);
});