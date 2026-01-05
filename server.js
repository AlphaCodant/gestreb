//Port
const port = 3003;

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
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { Console } = require('console');
const axios = require('axios');

//const initializePassport = require("./passportConfig");


//Initialisation des modules
//initializePassport(passport);
dotenv.config();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static('public'));
app.use(express.json());
app.set('view engine','ejs')
app.use(cors({
    origin:'*'
}));
app.use(flash());
app.use(
    session({
      name : 'sid',
      secret: process.env.MY_SECRET,
      resave: false,
      saveUninitialized: false
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
  });
  

//Connexion à la base de donnée postgreSql

const client = new Client({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    port: process.env.DB_PORT,
    password:process.env.DB_PWD,    
    database:process.env.DB_NAME,
    ssl:true
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
function authenticateToken(req, res, next) {
    const token = req.cookies.token; // On récupère le token depuis les cookies
  
    if (!token) return res.redirect('/connexion'); // Si aucun token, rediriger vers la page de connexion
  
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) return res.redirect('/connexion'); // Token invalide, rediriger vers login
      req.user = user;
      next();
    });
  }
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
    res.redirect('/accueil');
});

app.get('/data',authenticateToken,(req,res)=>{
    res.json(control[0]);
    control=[];
    console.log();
});

app.get('/accueil',(req,res)=>{
    res.render('accueil');
});
app.get('/stats',authenticateToken,(req,res)=>{
    res.render('stats');
});
app.get('/fiche',authenticateToken,(req,res)=>{
    res.render('table');
});

app.get('/fiche2',authenticateToken,(req,res)=>{
    res.render('tableau');
});

app.get('/devis/:id',authenticateToken,(req,res)=>{
    const {tokenY} = req.user;
    res.render('tableau',{id:tokenY});
});
app.get('/devis',authenticateToken,(req,res)=>{
    const {tokenY} = req.user;
    res.redirect(`/devis/${tokenY}`);
});

app.get('/statistiques/:id',authenticateToken,(req,res)=>{
    const {tokenY} = req.user;
    res.render('ch_stats',{id:tokenY});
});
app.get('/statistiques',authenticateToken,(req,res)=>{
    const {tokenY} = req.user;
    res.redirect(`/statistiques/${tokenY}`);
});

app.get('/connexion',(req,res)=>{
    res.render('connexion');
});
app.get('/admin/inscrit',(req,res)=>{
    res.render('admin_inscrit');
});
app.get('/admin/membre',(req,res)=>{
    res.render('admin_membre');
});
app.get('/admin/connecte',(req,res)=>{
    res.render('admin_connecte');
});
app.get('/admin/demande',(req,res)=>{
    res.render('admin_demande');
});
app.get('/admin/:id',authenticateToken,(req,res)=>{
    const {tokenY} = req.user;
    let inscrits = [];
    client.query(
        `SELECT count (*) FROM utilisateur`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                inscrits.push(results.rows[0].count);
            }
        });
        client.query(
        `SELECT count (*) FROM utilisateur WHERE statut like 'valide'`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                inscrits.push(results.rows[0].count);
            }
        });
        client.query(
            `SELECT count (*) FROM utilisateur WHERE statut like 'attente'`,
            (err, results) => {
                if (err) {
                console.log(err);
                }else{
                    inscrits.push(results.rows[0].count);
                }
            });
            client.query(
                `SELECT count (*) FROM utilisateurs WHERE etat like 'connecte'`,
                (err, results) => {
                    if (err) {
                    console.log(err);
                    }else{
                        inscrits.push(results.rows[0].count);
                    }
                });
    setTimeout(()=>{
        res.render('admin',{id:tokenY,inscrit:inscrits[0],membre:inscrits[1],connecte:inscrits[3],attente:inscrits[2]});
    },3000)
});
app.get('/inscription',securedConnect.ensureLoggedOut({redirectTo:'/page'}),(req,res)=>{
    res.render('inscription');
});
//let page=token(20);

let donnee_connect=[]


app.get(`/page/:id`,authenticateToken,(req,res)=>{
    result.length=0;
    const fonction = {'sangoue':2,'tene':1,'cg':3,'csotc':4,'agent_sotc':5,'agent_tene':6,'agent_sangoue':7,'autre_sodefor':8};
    const {email} = req.user;
    const {tokenY} = req.user;
    const {ugf} = req.user;
    const {admin} = req.user;
    client.query(`SELECT ugf FROM utilisateurs WHERE email='${email}'`,
        (err,result)=>{
            if (err){
                console.log(err);
            }else{
                console.log(fonction[result.rows[0].ugf]);
                res.render('dashboard_conn',{id:tokenY,ugf:ugf,admin:admin,poste:fonction[result.rows[0].ugf]});
            }
        }
    )
});
setInterval(()=>{
app.get('/api/parcelles/:id', async (req, res) => {
    client.query(`SELECT * FROM parcelles WHERE id='${req.params.id}'`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                res.render('admin_inscrit_id',{numero : results.rows[0].numero,ess : results.rows[0].essence });
            }
        }
    );
  });
},1000);
  app.post('/api/parcelles/:id', async (req, res) => {
    try {
      const result = await client.query('SELECT * FROM parcelles ORDER BY annee ASC');
      res.json(result.rows);
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      res.status(500).send('Erreur serveur');
    }
  });

  app.get(`/get/parcelles/mise_en_place/:foret`, async (req, res) => {
    const annee_actuelle = new Date().getFullYear();
    try {
      const result = await client.query(`SELECT a.fk_cout_fixe AS travail,SUM(b.superficie) AS objectif, SUM(a.superficie_traitee) 
                                        AS realise FROM appliquer AS a, parcelles AS b
                                        WHERE a.fk_parcelles=b.id AND fk_cout_fixe between 1 AND 7 AND b.foret=${req.params.foret} 
                                        and annee=${annee_actuelle}
                                        GROUP BY a.fk_cout_fixe ORDER BY a.fk_cout_fixe ASC`);
      res.json(result.rows);
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      res.status(500).send('Erreur serveur');
    }
  });
  
  app.get(`/get/parcelles/mise_en_place/:foret/:travail`, async (req, res) => {
    const annee_actuelle = new Date().getFullYear();
    try {
      const result = await client.query(`SELECT a.id,a.numero,a.annee,a.essence,a.superficie,b.superficie_traitee,
        TO_CHAR(b.date_init, 'dd/mm/yyyy') as date_init,TO_CHAR(b.date_fin, 'dd/mm/yyyy') as date_fin
         FROM parcelles AS a, appliquer AS b WHERE a.id=b.fk_parcelles AND a.foret=${req.params.foret} AND a.annee=${annee_actuelle} AND b.fk_cout_fixe = ${req.params.travail} ORDER BY id ASC`);
      res.json(result.rows);
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      res.status(500).send('Erreur serveur');
    }
  });
  app.post(`/get/parcelles/mise_en_place/:foret/:travail`, async (req, res) => {
    const {realise} = req.body;
    const {date_debut} = req.body;
    const {date_fin} = req.body;
    console.log(realise);
    console.log(date_debut);
    console.log(date_fin);
    /* Vérifier si "updates" est un tableau
    if (!realise || !Array.isArray(realise) || !date_debut || !Array.isArray(date_debut)) {
        return res.status(400).send('Paramètres manquants ou mal formés');
    }*/

    const { foret, travail } = req.params;
    // Vérifier que les paramètres "foret" et "travail" sont présents
    if (!foret || !travail) {
        return res.status(400).send('Les paramètres "foret" et "travail" sont requis');
    }

    try {
        if(date_debut){
            for (const debut of date_debut) {
                // Vérifier que chaque "update" contient un id et une value
                if (!debut.id) {
                    return res.status(400).send('Chaque mise à jour doit contenir un "id" et une "value"');
                }

                // Si la valeur de "update.value" est nulle ou vide, ne rien faire pour cette entrée
                if (debut.value === null || debut.value === '') {
                    console.log(`La valeur pour l'ID ${debut.id} est nulle ou vide, aucune mise à jour effectuée.`);
                    continue;  // Passer à la prochaine mise à jour sans rien faire
                }

                // Assurer que l'id est un nombre valide
                const id = parseInt(debut.id);
                if (isNaN(id)) {
                    return res.status(400).send('L\'ID est invalide');
                }

                // Exécuter la mise à jour dans la base de données
                const query = 'UPDATE appliquer SET date_init = $1 WHERE fk_parcelles = $2 AND fk_cout_fixe = $3';
                await client.query(query, [debut.value, id, travail]);
            }
        }

        if(realise){
            for (const update of realise) {
                // Vérifier que chaque "update" contient un id et une value
                if (!update.id) {
                    return res.status(400).send('Chaque mise à jour doit contenir un "id" et une "value"');
                }

                // Si la valeur de "update.value" est nulle ou vide, ne rien faire pour cette entrée
                if (update.value === null || update.value === '') {
                    console.log(`La valeur pour l'ID ${update.id} est nulle ou vide, aucune mise à jour effectuée.`);
                    continue;  // Passer à la prochaine mise à jour sans rien faire
                }

                // Assurer que l'id est un nombre valide
                const id = parseInt(update.id);
                if (isNaN(id)) {
                    return res.status(400).send('L\'ID est invalide');
                }

                // Exécuter la mise à jour dans la base de données
                const query = 'UPDATE appliquer SET superficie_traitee = $1 WHERE fk_parcelles = $2 AND fk_cout_fixe = $3';
                await client.query(query, [parseFloat(update.value), id, travail]);
            }
        }

        if(date_fin){
            for (const fin of date_fin) {
                // Vérifier que chaque "update" contient un id et une value
                if (!fin.id) {
                    return res.status(400).send('Chaque mise à jour doit contenir un "id" et une "value"');
                }

                // Si la valeur de "update.value" est nulle ou vide, ne rien faire pour cette entrée
                if (fin.value === null || fin.value === '') {
                    console.log(`La valeur pour l'ID ${fin.id} est nulle ou vide, aucune mise à jour effectuée.`);
                    continue;  // Passer à la prochaine mise à jour sans rien faire
                }

                // Assurer que l'id est un nombre valide
                const id = parseInt(fin.id);
                if (isNaN(id)) {
                    return res.status(400).send('L\'ID est invalide');
                }

                // Exécuter la mise à jour dans la base de données
                const query = 'UPDATE appliquer SET date_fin = $1 WHERE fk_parcelles = $2 AND fk_cout_fixe = $3';
                await client.query(query, [fin.value, id, travail]);
            }
        }

        res.status(200).send('Mise à jour réussie');
    } catch (err) {
        console.error('Erreur lors de la mise à jour:', err);
        res.status(500).send('Erreur serveur');
    }
});

//-------------------------------------Mise à jour mise en place --------------------------------------------------------

app.post(`/get/parcelles/mise_en_place/:foret`, async (req, res) => {
   const annee = new Date().getFullYear();
    try {           // Exécuter la mise à jour dans la base de données
            const query = `UPDATE resultats SET (objectif,realise) =((SELECT SUM(superficie) from parcelles where foret=${req.params.foret}
                            AND annee=${annee}),
                            (SELECT SUM(a.superficie_traitee/7) FROM appliquer AS a, parcelles AS b 
                        WHERE a.fk_parcelles=b.id AND a.fk_cout_fixe in 
                        (SELECT id FROM cout_fixe WHERE fk_resultat=1) AND b.foret=${req.params.foret} AND b.annee=${annee})) WHERE id = 1`;
            await client.query(query);
    
    } catch (err) {
        console.error('Erreur lors de la mise à jour:', err);
        res.status(500).send('Erreur serveur');
    }
});

//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------Entretien Annee 0 ------------------------------------------------------------------------

app.post(`/get/parcelles/entretien0/:foret`, async (req, res) => {
    const annee = new Date().getFullYear();
     try {           // Exécuter la mise à jour dans la base de données
             const query = `UPDATE resultats SET (objectif,realise) =((SELECT SUM(superficie) from parcelles where foret=${req.params.foret}
                            AND annee=${annee})*2,
                            (SELECT passage_1+passage_2 FROM (SELECT DISTINCT((SELECT sum(a.superficie_traitee)/3.2 
                            FROM public.appliquer as a, public.parcelles as b 
                            WHERE a.fk_parcelles=b.id 
                            AND fk_cout_fixe between 8 and 11 AND b.annee=${annee} AND b.foret=${req.params.foret})) AS passage_1, 
                            (SELECT sum(a.superficie_traitee)/2 FROM public.appliquer as a, public.parcelles as b 
                            WHERE a.fk_parcelles=b.id 
                            AND fk_cout_fixe between 12 and 13 AND b.annee=${annee} AND b.foret=${req.params.foret}) AS passage_2 
                            FROM appliquer))) 
                            WHERE fk_activite = 2 AND annee = ${annee}`;
             await client.query(query);
             console.log(annee);
     
     } catch (err) {
         console.error('Erreur lors de la mise à jour:', err);
         res.status(500).send('Erreur serveur');
     }
 });
 
 //-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------Entretien Annee 1 ------------------------------------------------------------------------

app.post(`/get/parcelles/entretien1/:foret`, async (req, res) => {
    const annee = new Date().getFullYear();
     try {           // Exécuter la mise à jour dans la base de données
             const query =`UPDATE resultats SET (objectif,realise) =((SELECT SUM(superficie) from parcelles where foret=${req.params.foret}
                            AND annee=${annee-1})*3,
                            (SELECT passage_1+passage_2+passage_3 FROM (SELECT DISTINCT((SELECT sum(a.superficie_traitee)/2.2 FROM public.appliquer as a, public.parcelles as b 
                            WHERE a.fk_parcelles=b.id 
                            AND fk_cout_fixe between 14 and 16 AND b.annee=${annee-1} AND b.foret=${req.params.foret})) AS passage_1, 
                            (SELECT sum(a.superficie_traitee)/2 FROM public.appliquer as a, public.parcelles as b 
                            WHERE a.fk_parcelles=b.id 
                            AND fk_cout_fixe between 17 and 18 AND b.annee=${annee-1} AND b.foret=${req.params.foret}) AS passage_2,
                            (SELECT sum(a.superficie_traitee)/2 FROM public.appliquer as a, public.parcelles as b 
                            WHERE a.fk_parcelles=b.id 
                            AND fk_cout_fixe between 19 and 20 AND b.annee=${annee-1} AND b.foret=${req.params.foret}) AS passage_3
                            FROM appliquer)))
                            WHERE fk_activite = 3 AND annee = ${annee-1}`;
             await client.query(query);
     
     } catch (err) {
         console.error('Erreur lors de la mise à jour:', err);
         res.status(500).send('Erreur serveur');
     }
 });
 
 //-------------------------------------------------------------------------------------------------------------------------------

 //-------------------------------------Entretien Annee 2 ------------------------------------------------------------------------

app.post(`/get/parcelles/entretien2/:foret`, async (req, res) => {
    const annee = new Date().getFullYear();
     try {           // Exécuter la mise à jour dans la base de données
             const query =`UPDATE resultats SET (objectif,realise) =((SELECT SUM(superficie) from parcelles where foret=${req.params.foret}
                            AND annee=${annee-2})*3,
                            (SELECT passage_1+passage_2+passage_3 FROM (SELECT DISTINCT((SELECT sum(a.superficie_traitee)/2.2 FROM public.appliquer as a, public.parcelles as b 
                            WHERE a.fk_parcelles=b.id 
                            AND fk_cout_fixe between 14 and 16 AND b.annee=${annee-2} AND b.foret=${req.params.foret})) AS passage_1, 
                            (SELECT sum(a.superficie_traitee)/2 FROM public.appliquer as a, public.parcelles as b 
                            WHERE a.fk_parcelles=b.id 
                            AND fk_cout_fixe between 17 and 18 AND b.annee=${annee-2} AND b.foret=${req.params.foret}) AS passage_2,
                            (SELECT sum(a.superficie_traitee)/2 FROM public.appliquer as a, public.parcelles as b 
                            WHERE a.fk_parcelles=b.id 
                            AND fk_cout_fixe between 19 and 20 AND b.annee=${annee-2} AND b.foret=${req.params.foret}) AS passage_3
                            FROM appliquer)))
                            WHERE fk_activite = 4 AND annee = ${annee-2}`;
             await client.query(query);
     
     } catch (err) {
         console.error('Erreur lors de la mise à jour:', err);
         res.status(500).send('Erreur serveur');
     }
 });
 
 //-------------------------------------------------------------------------------------------------------------------------------

 //-------------------------------------Entretien Annee 3 ------------------------------------------------------------------------

app.post(`/get/parcelles/entretien3/:foret`, async (req, res) => {
    const annee = new Date().getFullYear();
     try {           // Exécuter la mise à jour dans la base de données
             const query =`UPDATE resultats SET (objectif,realise) =((SELECT SUM(superficie) from parcelles where foret=${req.params.foret}
                            AND annee=${annee-3})*2,
                            (SELECT passage_1+passage_2 FROM (SELECT DISTINCT((SELECT sum(a.superficie_traitee)/2 FROM public.appliquer as a, public.parcelles as b 
                            WHERE a.fk_parcelles=b.id 
                            AND fk_cout_fixe between 28 and 29 AND b.annee=${annee-3} AND b.foret=${req.params.foret})) AS passage_1, (SELECT sum(a.superficie_traitee)/2 FROM public.appliquer as a, public.parcelles as b 
                            WHERE a.fk_parcelles=b.id 
                            AND fk_cout_fixe between 30 and 31 AND b.annee=${annee-3} AND b.foret=${req.params.foret}) AS passage_2 FROM appliquer))) 
                            WHERE fk_activite = 5 AND annee = ${annee-3}`;
             await client.query(query);
     
     } catch (err) {
         console.error('Erreur lors de la mise à jour:', err);
         res.status(500).send('Erreur serveur');
     }
 });
 
 //-------------------------------------------------------------------------------------------------------------------------------

//-------------------------------------Mise à jour mise en place --------------------------------------------------------

app.get(`/get/parcelles/mise_en_place/:foret`, async (req, res) => {
    const annee = new Date().getFullYear();
     try {           // Exécuter la mise à jour dans la base de données
             const  query = `SELECT * FROM resultats WHERE fk_activite = 1 AND annee = ${annee} AND fk_foret = ${req.params.foret}`;
             const result = await client.query(query);
             res.json(result.rows);
     
     } catch (err) {
         console.error('Erreur lors de la mise à jour:', err);
         res.status(500).send('Erreur serveur');
     }
 });
 
 //-------------------------------------------------------------------------------------------------------------------------------
 //-------------------------------------Entretien Annee 0 ------------------------------------------------------------------------
 
 app.get(`/get/parcelles/entretien0/:foret`, async (req, res) => {
     const annee = new Date().getFullYear();
      try {           // Exécuter la mise à jour dans la base de données
              const query = `SELECT * FROM resultats WHERE fk_activite = 2 AND annee = ${annee} AND fk_foret = ${req.params.foret}`;
            const result = await client.query(query);
            res.json(result.rows);
      
      } catch (err) {
          console.error('Erreur lors de la mise à jour:', err);
          res.status(500).send('Erreur serveur');
      }
  });
  
  //-------------------------------------------------------------------------------------------------------------------------------
 
 //-------------------------------------Entretien Annee 1 ------------------------------------------------------------------------
 
 app.get(`/get/parcelles/entretien1/:foret`, async (req, res) => {
     const annee = new Date().getFullYear();
      try {           // Exécuter la mise à jour dans la base de données
              const query = `SELECT * FROM resultats WHERE fk_activite = 3 AND annee = ${annee-1} AND fk_foret = ${req.params.foret}`;
            const result = await client.query(query);
            res.json(result.rows);
      
      } catch (err) {
          console.error('Erreur lors de la mise à jour:', err);
          res.status(500).send('Erreur serveur');
      }
  });
  
  //-------------------------------------------------------------------------------------------------------------------------------
 
  //-------------------------------------Entretien Annee 2 ------------------------------------------------------------------------
 
 app.get(`/get/parcelles/entretien2/:foret`, async (req, res) => {
     const annee = new Date().getFullYear();
      try {           // Exécuter la mise à jour dans la base de données
              const query = `SELECT * FROM resultats WHERE fk_activite = 4 AND annee = ${annee-2} AND fk_foret = ${req.params.foret}`;
            const result = await client.query(query);
            res.json(result.rows);
      
      } catch (err) {
          console.error('Erreur lors de la mise à jour:', err);
          res.status(500).send('Erreur serveur');
      }
  });
  
  //-------------------------------------------------------------------------------------------------------------------------------
 
  //-------------------------------------Entretien Annee 3 ------------------------------------------------------------------------
 
 app.get(`/get/parcelles/entretien3/:foret`, async (req, res) => {
     const annee = new Date().getFullYear();
      try {           // Exécuter la mise à jour dans la base de données
              const query = `SELECT * FROM resultats WHERE fk_activite = 5 AND annee = ${annee-3} AND fk_foret = ${req.params.foret}`;
            const result = await client.query(query);
            res.json(result.rows);
      
      } catch (err) {
          console.error('Erreur lors de la mise à jour:', err);
          res.status(500).send('Erreur serveur');
      }
  });
  
  //-------------------------------------------------------------------------------------------------------------------------------

  app.get('/api/cugf/mise_en_place/:foret/:travail/:nom',authenticateToken, async (req, res) => {
    client.query(`SELECT * FROM parcelles WHERE foret=${req.params.foret}`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                res.render('mise_en_place_parc',{travail:req.params.travail,foret:req.params.foret,nom:req.params.nom.toUpperCase()});
            }
        }
    );
  });
  app.get('/api/cugf/entretien/:annee/:foret',authenticateToken, async (req, res) => {
    
    client.query(`SELECT * FROM parcelles WHERE id=${req.params.foret} `,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                res.render('entretien',{foret:req.params.foret,annee:req.params.annee});
            }
        }
    );
  });
  app.get('/api/cugf/entretien_1/:annee/:foret',authenticateToken, async (req, res) => {
        res.render('entretien_1',{foret:req.params.foret,annee:req.params.annee});
  });
  app.get('/api/cugf/entretien_2/:annee/:foret',authenticateToken, async (req, res) => {
    
    client.query(`SELECT * FROM parcelles WHERE id=${req.params.foret} `,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                res.render('entretien_2',{foret:req.params.foret,annee:req.params.annee});
            }
        }
    );
  });
  app.get('/api/cugf/entretien_3/:annee/:foret',authenticateToken, async (req, res) => {
    
    client.query(`SELECT * FROM parcelles WHERE id=${req.params.foret} `,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                res.render('entretien_3',{foret:req.params.foret,annee:req.params.annee});
            }
        }
    );
  });
  app.get('/api/cugf/entretien_recap/:foret',authenticateToken, async (req, res) => {
    
    client.query(`SELECT * FROM parcelles WHERE id=${req.params.foret} `,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                res.render('entretien_recap',{foret:req.params.foret});
            }
        }
    );
  });
  app.get('/api/cugf/entretien/:annee/:foret/:travail',authenticateToken, async (req, res) => {
    res.render('entretien_parc',{foret:req.params.foret,annee:req.params.annee,travail:req.params.travail});
  });
  app.get('/api/cugf/entretien_1/:annee/:foret/:travail',authenticateToken, async (req, res) => {
    res.render('entretien_parc',{foret:req.params.foret,annee:req.params.annee,travail:req.params.travail});
  });
  app.get('/api/cugf/entretien_2/:annee/:foret/:travail',authenticateToken, async (req, res) => {
    res.render('entretien_parc',{foret:req.params.foret,annee:req.params.annee,travail:req.params.travail});
  });
  app.get('/api/cugf/entretien_3/:annee/:foret/:travail',authenticateToken, async (req, res) => {
    res.render('entretien_parc',{foret:req.params.foret,annee:req.params.annee,travail:req.params.travail});
  });
  
  app.get(`/get/parcelles/entretien/:annee/:foret/:travail`, async (req, res) => {
    const annee_actuelle = new Date().getFullYear();
    const annee=req.params.annee;
    try {
        if (annee!=0){
            const result = await client.query(`SELECT a.id,a.numero,a.annee,a.essence,a.superficie,b.superficie_traitee
                FROM parcelles AS a, appliquer AS b WHERE a.id=b.fk_parcelles AND a.foret=${req.params.foret} 
                AND a.annee=${annee_actuelle-annee} AND b.fk_cout_fixe = ${req.params.travail} ORDER BY id ASC`);
             res.json(result.rows);
        }else{
            const result = await client.query(`SELECT a.id,a.numero,a.annee,a.essence,a.superficie,b.superficie_traitee
                FROM parcelles AS a, appliquer AS b WHERE a.id=b.fk_parcelles AND a.foret=${req.params.foret} 
                AND a.annee=${annee_actuelle} AND b.fk_cout_fixe = ${req.params.travail} ORDER BY id ASC`);
             res.json(result.rows);
        }
      
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      res.status(500).send('Erreur serveur');
    }
  });
  app.get(`/get/parcelles/entretien/:annee/:foret`, async (req, res) => {
    const annee_actuelle = new Date().getFullYear();
    const annee=req.params.annee;
    try {
        if (annee!=0){
            const result = await client.query(`SELECT b.fk_cout_fixe,sum(a.superficie) as superficie,sum(b.superficie_traitee)
        as superficie_traitee
         FROM parcelles AS a, appliquer AS b WHERE a.id=b.fk_parcelles AND a.foret=${req.params.foret} 
         AND a.annee=${annee_actuelle-annee} group by fk_cout_fixe ORDER BY fk_cout_fixe ASC`);
      res.json(result.rows);
        }else{
            const result = await client.query(`SELECT b.fk_cout_fixe,sum(a.superficie) as superficie,sum(b.superficie_traitee)
        as superficie_traitee
         FROM parcelles AS a, appliquer AS b WHERE a.id=b.fk_parcelles AND a.foret=${req.params.foret} 
         AND a.annee=${annee_actuelle} group by fk_cout_fixe ORDER BY fk_cout_fixe ASC`);
      res.json(result.rows);
        }
      
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      res.status(500).send('Erreur serveur');
    }
  });
  app.post(`/get/parcelles/entretien/:annee/:foret/:travail`, async (req, res) => {
    const { updates } = req.body;
    console.log(updates);

    // Vérifier si "updates" est un tableau
    if (!updates || !Array.isArray(updates)) {
        return res.status(400).send('Paramètre "updates" manquant ou mal formé');
    }

    const { foret, travail } = req.params;
    // Vérifier que les paramètres "foret" et "travail" sont présents
    if (!foret || !travail) {
        return res.status(400).send('Les paramètres "foret" et "travail" sont requis');
    }

    try {
        for (const update of updates) {
            // Vérifier que chaque "update" contient un id et une value
            if (!update.id) {
                return res.status(400).send('Chaque mise à jour doit contenir un "id" et une "value"');
            }

            // Si la valeur de "update.value" est nulle ou vide, ne rien faire pour cette entrée
            if (update.value === null || update.value === '') {
                console.log(`La valeur pour l'ID ${update.id} est nulle ou vide, aucune mise à jour effectuée.`);
                continue;  // Passer à la prochaine mise à jour sans rien faire
            }

            // Assurer que l'id est un nombre valide
            const id = parseInt(update.id);
            if (isNaN(id)) {
                return res.status(400).send('L\'ID est invalide');
            }

            // Exécuter la mise à jour dans la base de données
            const query = 'UPDATE appliquer SET superficie_traitee = $1 WHERE fk_parcelles = $2 AND fk_cout_fixe = $3';
            await client.query(query, [parseFloat(update.value), id, travail]);
        }
        res.status(200).send('Mise à jour réussie');
    } catch (err) {
        console.error('Erreur lors de la mise à jour:', err);
        res.status(500).send('Erreur serveur');
    }
});
app.get('/get/parcelles/entretien/:foret', async (req, res) => {
    
    const annee_actuelle = new Date().getFullYear();
    const annee=req.params.annee;
    try {       
        const result = await client.query(`SELECT SUM(objectif) AS Objectif ,SUM(realise) AS Realise FROM resultats 
                                           WHERE fk_activite BETWEEN 2 AND 5 AND fk_foret=${req.params.foret}`);
      res.json(result.rows);
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      res.status(500).send('Erreur serveur');
    }
  });

  app.get('/get/parcelles/cu/graph1/:foret/:annee', async (req, res) => {
    
    //const annee_actuelle = new Date().getFullYear();
    const annee=req.params.annee;
    const foret=req.params.foret;
    try {       
        const result = await client.query(`
            SELECT (SELECT sum(a.superficie_traitee) as raba FROM appliquer a,parcelles b WHERE a.fk_parcelles=b.id AND b.foret=${foret} AND 
            fk_cout_fixe =1 AND b.annee=${annee}),
            (SELECT sum(superficie_traitee) as aba FROM appliquer a,parcelles b WHERE a.fk_parcelles=b.id AND b.foret=${foret} AND 
            fk_cout_fixe =2 AND b.annee=${annee}),
            (SELECT sum(superficie_traitee) as bru FROM appliquer a,parcelles b WHERE a.fk_parcelles=b.id AND b.foret=${foret} AND 
            fk_cout_fixe =3 AND b.annee=${annee}),
            (SELECT sum(superficie_traitee) as piq FROM appliquer a,parcelles b WHERE a.fk_parcelles=b.id AND b.foret=${foret} AND 
            fk_cout_fixe =4 AND b.annee=${annee}),
            (SELECT sum(superficie_traitee) as ouv FROM appliquer a,parcelles b WHERE a.fk_parcelles=b.id AND b.foret=${foret} AND 
            fk_cout_fixe =5 AND b.annee=${annee}),
            (SELECT sum(superficie_traitee) as trou FROM appliquer a,parcelles b WHERE a.fk_parcelles=b.id AND b.foret=${foret} AND 
            fk_cout_fixe =6 AND b.annee=${annee}),
            (SELECT sum(superficie_traitee) as plan FROM appliquer a,parcelles b WHERE a.fk_parcelles=b.id AND b.foret=${foret} AND 
            fk_cout_fixe =7 AND b.annee=${annee}) 
            FROM appliquer LIMIT 1`);
      res.json(result.rows);
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      res.status(500).send('Erreur serveur');
    }
  });

  app.get('/get/fiches/cu/graph1/:id', async (req, res) => {
    
    try {       
        const result = await client.query(`
            select c.numero as numero, c.essence as essence,c.annee as annee,c.partenaire as partenaire,c.densite as densite,c.ugf as ugf, c.foret as foret, c.superficie as superficie, c.partenaire as financement,
            a.fk_cout_fixe as id_travail, TO_CHAR(a.date_init, 'dd/mm/yyyy') as date_debut, TO_CHAR(a.date_fin, 'dd/mm/yyyy') as date_fin,a.superficie_traitee as realise, b.cout as cout 
            from appliquer as a,cout_fixe as b , parcelles as c
            where a.fk_cout_fixe=b.id and a.fk_parcelles=c.id and a.fk_parcelles = ${req.params.id} and a.fk_cout_fixe between 1 and 13
            order by a.fk_cout_fixe asc
            `);
      res.json(result.rows);
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      res.status(500).send('Erreur serveur');
    }
  });
  
  app.get('/api/cugf/mise_en_place/:foret',authenticateToken, async (req, res) => {
    
    client.query(`SELECT * FROM parcelles WHERE id=${req.params.foret} `,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                res.render('mise_en_place',{foret:req.params.foret});
            }
        }
    );
  });
  

  app.get('/api/cugf/:foret',authenticateToken,(req, res) => {
    const {tokenY} = req.user;
    res.render('interface_cugf',{foret:req.params.foret,id:tokenY});

  });
  app.get("/membres", (req, res) => {
    client.query(`
        SELECT a.id,b.foret as Foret,a.annee as Annee,a.numero,a.essence as Essence,
        a.densite as Densité,a.partenaire as Partenaire,a.longitude as X,a.latitude as Y,
        a.superficie as Superficie FROM parcelles AS a,foret as b WHERE a.foret=b.id ORDER BY a.numero ASC`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                console.log(results.rows);
               const membres =  results.rows
               const totalMembres = membres.length;
               const superficieTotale = membres.reduce((total, membre) => total + parseFloat(membre.superficie), 0);
               const essencePredominante = {};
               membres.forEach((membre) => {
                   const essence = membre.essence;
                     if (essencePredominante[essence]) {
                            essencePredominante[essence] += 1;
                        } else {
                            essencePredominante[essence] = 1;
                        }
                });
                let maxCount = 0;
                let predominantEssence = '';    
                for (const essence in essencePredominante) {
                    if (essencePredominante[essence] > maxCount) {
                        maxCount = essencePredominante[essence];
                        predominantEssence = essence;
                    }
                }
                partenairePredominant = {};
                membres.forEach((membre) => {
                    const partenaire = membre.partenaire;   
                        if (partenairePredominant[partenaire]) {
                                 partenairePredominant[partenaire] += 1;
                                } else {
                                    partenairePredominant[partenaire] = 1;
                                }
                        });
                let maxPartenaireCount = 0;
                
                let predominantPartenaire = '';
                for (const partenaire in partenairePredominant) {
                    if (partenairePredominant[partenaire] > maxPartenaireCount) {
                        maxPartenaireCount = partenairePredominant[partenaire];
                        predominantPartenaire = partenaire;
                    }
                }
               res.render("membre", { title: "Gestion des parcelles", membre: membres, 
                totalMembres: totalMembres, superficieTotale: Math.round(superficieTotale),
                predominantEssence: predominantEssence,occurance:maxCount,
                predominantPartenaire: predominantPartenaire});
            }
        }
        
    );
});
//-------------------------------------------------------------------------------------


//-------Mise en place modèle membre------------------------------------------------------------

app.get("/mise_en_place/:id", (req, res) => {
    
    client.query(`
        SELECT a.id,b.foret as Foret,a.annee as Annee,a.numero,a.essence as Essence,
        a.densite as Densité,a.partenaire as Partenaire,a.longitude as X,a.latitude as Y,
        a.superficie as Superficie FROM parcelles AS a,foret as b WHERE a.foret=b.id ORDER BY a.numero ASC`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                console.log(results.rows);
               const membres =  results.rows
               const totalMembres = membres.length;
               const superficieTotale = membres.reduce((total, membre) => total + parseFloat(membre.superficie), 0);
               const essencePredominante = {};
               membres.forEach((membre) => {
                   const essence = membre.essence;
                     if (essencePredominante[essence]) {
                            essencePredominante[essence] += 1;
                        } else {
                            essencePredominante[essence] = 1;
                        }
                });
                let maxCount = 0;
                let predominantEssence = '';    
                for (const essence in essencePredominante) {
                    if (essencePredominante[essence] > maxCount) {
                        maxCount = essencePredominante[essence];
                        predominantEssence = essence;
                    }
                }
                partenairePredominant = {};
                membres.forEach((membre) => {
                    const partenaire = membre.partenaire;   
                        if (partenairePredominant[partenaire]) {
                                 partenairePredominant[partenaire] += 1;
                                } else {
                                    partenairePredominant[partenaire] = 1;
                                }
                        });
                let maxPartenaireCount = 0;
                
                let predominantPartenaire = '';
                for (const partenaire in partenairePredominant) {
                    if (partenairePredominant[partenaire] > maxPartenaireCount) {
                        maxPartenaireCount = partenairePredominant[partenaire];
                        predominantPartenaire = partenaire;
                    }
                }
               res.render("membre_mise", {id:req.params.id,title: "Gestion des parcelles", membre: membres, 
                totalMembres: totalMembres, superficieTotale: Math.round(superficieTotale),
                predominantEssence: predominantEssence,occurance:maxCount,
                predominantPartenaire: predominantPartenaire});
            }
        }
        
    );
});

app.post('/mise_en_place', async (req, res) => {
    // Récupérer les données envoyées par le client
    const { foret, annees } = req.body; 
    console.log("Forêts sélectionnées:", foret, " | Années sélectionnées:", annees);
 
    // Vérifier si les données sont présentes et sont des tableaux non vides
    if (!foret || !Array.isArray(foret) || foret.length === 0 || 
        !annees || !Array.isArray(annees) || annees.length === 0) {
      return res.status(400).json({ message: 'Les listes de forêts et d\'années sont requises et ne doivent pas être vides.' });
    }
 
    // Préparation des listes d'IDs et d'années pour la clause SQL IN.
    // NOTE: On utilise .join(',') pour créer une chaîne de type: 1,2,3...
    // Si 'a.annee' était de type TEXT/VARCHAR, il faudrait encadrer chaque élément par des guillemets simples (ex: '2023','2024').
    const foretList = foret.map(f => Number(f)).join(',');
    const anneesList = annees.map(a => Number(a)).join(',');
 
    try {
      // Construction de la requête SQL corrigée
      const query = `
        SELECT a.id, b.foret AS Foret, a.annee AS Annee, a.numero, a.essence AS Essence,
        a.densite AS Densité, a.partenaire AS Partenaire, a.longitude AS X, a.latitude AS Y,
        a.superficie AS Superficie 
        FROM parcelles AS a
        INNER JOIN foret AS b ON a.foret = b.id 
        WHERE a.foret IN (${foretList}) 
        AND a.annee IN (${anneesList})
        ORDER BY a.numero ASC;`
      ;
      
      console.log("Requête SQL exécutée:", query);
 
      // Exécuter la requête SQL
      const result = await client.query(query);
 
      // Si des données sont trouvées, envoyer la réponse
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows);
      } else {
        return res.status(404).json({ message: 'Aucune donnée trouvée pour cette sélection.' });
      }
    } catch (error) {
      // Si une erreur survient ici, c'est généralement une erreur de syntaxe SQL ou de connexion DB.
      console.error('Erreur SQL ou de base de données:', error.message);
      return res.status(500).json({ message: 'Erreur du serveur interne lors de l\'exécution de la requête.' });
    }
});

app.post('/entretien_p', async (req, res) => {
    // Récupérer les données envoyées par le client
    const { foret, annees, entretien_annee } = req.body; 
    console.log("Forêts sélectionnées:", foret, " | Années sélectionnées:", annees, "| Entr :",entretien_annee);
 
    // Vérifier si les données sont présentes et sont des tableaux non vides
    if (!entretien_annee || !foret || !Array.isArray(foret) || foret.length === 0 || 
        !annees || !Array.isArray(annees) || annees.length === 0) {
      return res.status(400).json({ message: 'Les listes de forêts et d\'années sont requises et ne doivent pas être vides.' });
    }
 
    // Préparation des listes d'IDs et d'années pour la clause SQL IN.
    // NOTE: On utilise .join(',') pour créer une chaîne de type: 1,2,3...
    // Si 'a.annee' était de type TEXT/VARCHAR, il faudrait encadrer chaque élément par des guillemets simples (ex: '2023','2024').
    const foretList = foret.map(f => Number(f)).join(',');
    const anneesList = annees.map(a => Number(a)).join(',');
    const entr = entretien_annee.map(e => Number(e)).join(',');
    let annee=[];
    for (let i = 0; i < annees.length; i++) {
        for(let j=0; j<entretien_annee.length; j++){
            
        annee.push(annees[i]-entretien_annee[j]);
        }
    }
    //const anney=annee.map(a => Number(a)).join(',');
 
    try {
      // Construction de la requête SQL corrigée
      const query = `
        SELECT a.id, b.foret AS Foret, a.annee AS Annee, a.numero, a.essence AS Essence,
        a.densite AS Densité, a.partenaire AS Partenaire, a.longitude AS X, a.latitude AS Y,
        a.superficie AS Superficie 
        FROM parcelles AS a
        INNER JOIN foret AS b ON a.foret = b.id 
        WHERE a.foret IN (${foretList}) 
        AND a.annee IN (${annee})
        ORDER BY a.numero ASC;`
      ;
      
      console.log("Requête SQL exécutée:", query);
 
      // Exécuter la requête SQL
      const result = await client.query(query);
 
      // Si des données sont trouvées, envoyer la réponse
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows);
      } else {
        return res.status(404).json({ message: 'Aucune donnée trouvée pour cette sélection.' });
      }
    } catch (error) {
      // Si une erreur survient ici, c'est généralement une erreur de syntaxe SQL ou de connexion DB.
      console.error('Erreur SQL ou de base de données:', error.message);
      return res.status(500).json({ message: 'Erreur du serveur interne lors de l\'exécution de la requête.' });
    }
});

app.post('/rapport_entretien', async (req, res) => {
    // Récupérer les données envoyées par le client
    const { parcelleId } = req.body; 
  //  console.log("Forêts sélectionnées:", foret, " | Années sélectionnées:", annees, "| Entr :",entretien_annee);
 
    // Vérifier si les données sont présentes et sont des tableaux non vides
    if (!parcelleId) {
      return res.status(400).json({ message: 'Les listes de forêts et d\'années sont requises et ne doivent pas être vides.' });
    }
 
    // Préparation des listes d'IDs et d'années pour la clause SQL IN.
    // NOTE: On utilise .join(',') pour créer une chaîne de type: 1,2,3...
    // Si 'a.annee' était de type TEXT/VARCHAR, il faudrait encadrer chaque élément par des guillemets simples (ex: '2023','2024').
    // const foretList = foret.map(f => Number(f)).join(',');
    // const anneesList = annees.map(a => Number(a)).join(',');
    // const entr = entretien_annee.map(e => Number(e)).join(',');
    
    //const anney=annee.map(a => Number(a)).join(',');
 
    try {
      // Construction de la requête SQL corrigée
      const query = `
        SELECT a.montant AS Montant, a.travail AS Activite, b.superficie_traitee AS Realisé,b.fk_cout_fixe,
        c.numero AS Numéro_Parcelle FROM cout_fixe AS a
        INNER JOIN appliquer AS b ON a.id = b.fk_cout_fixe
        INNER JOIN parcelles AS c ON b.fk_parcelles = c.id WHERE c.id = ${parcelleId};`
      ;
      
      console.log("Requête SQL exécutée:", query);
 
      // Exécuter la requête SQL
      const result = await client.query(query);
 
      // Si des données sont trouvées, envoyer la réponse
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows);
        console.log(result.rows);
      } else {
        return res.status(404).json({ message: 'Aucune donnée trouvée pour cette sélection.' });
      }
    } catch (error) {
      // Si une erreur survient ici, c'est généralement une erreur de syntaxe SQL ou de connexion DB.
      console.error('Erreur SQL ou de base de données:', error.message);
      return res.status(500).json({ message: 'Erreur du serveur interne lors de l\'exécution de la requête.' });
    }
});
app.get('/entretien_p/:id', async (req, res) => {
     
    res.render('membre_entretien',{id:req.params.id});
});
app.get('/mission', async (req, res) => {
    
    try {
        const query = `SELECT * FROM cout_variable ORDER BY date_debut DESC`;
        const result = await client.query(query);
         if (result.rows.length > 0) {
        return res.status(200).json(result.rows);
        
      } else {
        return res.status(404).json({ message: 'Aucune donnée trouvée pour cette sélection.' });
      }
    } catch (err) {
        console.error('Erreur lors de la récupération des missions:', err);
    }
});
app.get('/plan_mission/:id', async (req, res) => {
     
    res.render('plan_mission',{id:req.params.id});
});
app.post('/sylviculture', async (req, res) => {
    // Récupérer les données envoyées par le client
    const { foret, annees } = req.body; 
    const entretien_annee = [4];
    console.log("Forêts sélectionnées:", foret, " | Années sélectionnées:", annees, "| Entr :",entretien_annee);
 
    // Vérifier si les données sont présentes et sont des tableaux non vides
    if (!entretien_annee || !foret || !Array.isArray(foret) || foret.length === 0 || 
        !annees || !Array.isArray(annees) || annees.length === 0) {
      return res.status(400).json({ message: 'Les listes de forêts et d\'années sont requises et ne doivent pas être vides.' });
    }
 
    // Préparation des listes d'IDs et d'années pour la clause SQL IN.
    // NOTE: On utilise .join(',') pour créer une chaîne de type: 1,2,3...
    // Si 'a.annee' était de type TEXT/VARCHAR, il faudrait encadrer chaque élément par des guillemets simples (ex: '2023','2024').
    const foretList = foret.map(f => Number(f)).join(',');
    const anneesList = annees.map(a => Number(a)).join(',');
    const entr = entretien_annee.map(e => Number(e)).join(',');
    let annee=[];
    for (let i = 0; i < annees.length; i++) {
        for(let j=0; j<entretien_annee.length; j++){
            
        annee.push(annees[i]-entretien_annee[j]);
        }
    }
    //const anney=annee.map(a => Number(a)).join(',');
 
    try {
      // Construction de la requête SQL corrigée
      const query = `
        SELECT a.id, b.foret AS Foret, a.annee AS Annee, a.numero, a.essence AS Essence,
        a.densite AS Densité, a.partenaire AS Partenaire, a.longitude AS X, a.latitude AS Y,
        a.superficie AS Superficie 
        FROM parcelles AS a
        INNER JOIN foret AS b ON a.foret = b.id 
        WHERE a.foret IN (${foretList}) 
        AND a.annee IN (${annee})
        ORDER BY a.numero ASC;`
      ;
      
      console.log("Requête SQL exécutée:", query);
 
      // Exécuter la requête SQL
      const result = await client.query(query);
 
      // Si des données sont trouvées, envoyer la réponse
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows);
      } else {
        return res.status(404).json({ message: 'Aucune donnée trouvée pour cette sélection.' });
      }
    } catch (error) {
      // Si une erreur survient ici, c'est généralement une erreur de syntaxe SQL ou de connexion DB.
      console.error('Erreur SQL ou de base de données:', error.message);
      return res.status(500).json({ message: 'Erreur du serveur interne lors de l\'exécution de la requête.' });
    }
});

app.get('/sylviculture/:id',authenticateToken,(req, res) => {
   
    res.render('membre_sylviculture',{id:req.params.id});

  });
app.get('/api/agents',(req,res)=>{
    const query = `SELECT * FROM agent ORDER BY nom_prenoms ASC`;
    client.query(query, (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération des agents:', err);
            res.status(500).json({ error: 'Erreur serveur' });
        } else {
            res.json(result.rows);
        }
    });
})

app.post('/api/planifier_mission', async (req, res) => {
    
    const { 
        missionData, 
        agentsSelectionnes, 
        parcellesSelectionnees, 
    } = req.body;

    // Destruction de l'objet missionData pour l'insertion
    const { 
        libele, 
        nb_jour, 
        nb_agent, 
        cout, 
        date_debut, 
        date_fin, 
        document_mission // Note: Le document est juste le chemin/nom du fichier ici
    } = missionData;
    const id_agent_string = agentsSelectionnes.join(', ');
    const parcelle_string = parcellesSelectionnees.join(', ');
    try {
      const query = `
        INSERT INTO cout_variable 
        (libele, Nb_jour, Nb_homme, cout, date_debut, date_fin, document, id_agent, parcelle,nb_agent,nb_parcelle,statut) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11,'false') RETURNING id;
      `;
      
      const values = [
        libele, 
        nb_jour, 
        nb_agent,
        cout, 
        date_debut, 
        date_fin,
        document_mission,
        id_agent_string,
        parcelle_string,
        agentsSelectionnes.length,
        parcellesSelectionnees.length
      ];
        console.log("Requête SQL exécutée:", query, "avec les valeurs:", values);
        const result = await client.query(query, values);
        const insertedId = result.rows[0].id;
        return res.status(201).json({ message: 'Plan de mission créé avec succès.', id: insertedId });
    } catch (error) {
      console.error('Erreur lors de la création du plan de mission:', error.message);
      return res.status(500).json({ message: 'Erreur du serveur interne lors de la création du plan de mission.' });
    }
});

app.get('/confirm_mission',(req, res) => {
    res.render('confirm_mission');

  });
  app.post('/api/valider_mission', async (req, res) => {
    const { 
        missionData, 
        agentsSelectionnes, 
        parcellesSelectionnees, 
    } = req.body;
    const nb_parcelle=parcellesSelectionnees.length;
    const nb_agent=agentsSelectionnes.length;
    console.log("Nombre de parcelles :",nb_parcelle);
    console.log("Nombre d'agents :",nb_agent);
    const document_mission = missionData.document_mission;
    try {
      // 1. Changement de la méthode POST à GET.
      // 2. Optimisation de la requête SQL pour récupérer la dernière ligne.
      const query = `
        SELECT id,id_agent,cout,document FROM cout_variable 
        ORDER BY id DESC 
        LIMIT 1;
      `;
      
      const result = await client.query(query);     
        
      if (result.rows.length > 0) {
        // Renvoie la première (et unique) ligne trouvée.
        const cout_parcelle = result.rows[0].cout / nb_parcelle;
        console.log("Coût par parcelle :",cout_parcelle);
        const resulId = result.rows[0].id;
        const id_agent = result.rows[0].id_agent;
        const document_mission_db = result.rows[0].document;
        console.log("Document mission DB :",document_mission_db);
        const id_mission = `
            SELECT id FROM activite 
            ORDER BY id DESC 
            LIMIT 1;
        
        `
        const result_id = await client.query(id_mission);
        if (result_id.rows.length > 0) {
            const missionId = result_id.rows[0].id;
            console.log("ID de la mission insérée :", missionId);
            const insertquery = `
            DO $$
            DECLARE
                v_libele TEXT;
                v_date_debut DATE;
                v_date_fin DATE;
                v_cout NUMERIC;
                parc TEXT;
                parc_id INTEGER;
                doc TEXT;
                r INTEGER := ${missionId+1};
            BEGIN
                -- Récupérer les valeurs une seule fois
                SELECT libele, date_debut, date_fin, cout, document
                INTO v_libele, v_date_debut, v_date_fin, v_cout, doc
                FROM cout_variable
                WHERE id = ${resulId};

                -- Boucle sur chaque parcelle extraite
                FOR parc IN
                    SELECT TRIM(p) AS numero
                    FROM unnest(string_to_array((SELECT parcelle FROM cout_variable WHERE id =${resulId}), ',')) AS p
                LOOP
                    -- Récupérer l'id de la parcelle correspondante
                    SELECT id INTO parc_id FROM parcelles WHERE numero = parc LIMIT 1;

                    -- Insertion dans la table activite
                    INSERT INTO activite (
                        id, libele, data_debut, date_fin, date_enreg,
                        "date reception", sup_traitee, operateur, cout_fixe,
                        cout_variable, parcelle, document, annee_exercice,id_mission
                    )
                    VALUES (
                        r, v_libele, v_date_debut, v_date_fin, v_date_fin,
                        v_date_fin, (SELECT superficie FROM parcelles WHERE id=parc_id),
                        (SELECT nom_prenoms FROM agent WHERE id in(${id_agent}) LIMIT 1), 0,
                        ${cout_parcelle}, parc_id, doc, 2025, ${resulId}
                    );

                    -- Incrémenter l'identifiant
                    r := r + 1;
                END LOOP;
            END
            $$ LANGUAGE plpgsql;

            `
           const reponse = await client.query(insertquery);
            if (reponse.rows.length > 0) {
                console.log("Insertion dans la table activite réussie pour la mission ID :", missionId);
            }
            else {
                console.log("Aucune insertion effectuée dans la table activite pour la mission ID :", missionId);
            }
        }else{
            const insertquery = `
            DO $$
            DECLARE
                v_libele TEXT;
                v_date_debut DATE;
                v_date_fin DATE;
                v_cout NUMERIC;
                parc TEXT;
                parc_id INTEGER;
                r INTEGER := 1;
            BEGIN
                -- Récupérer les valeurs une seule fois
                SELECT libele, date_debut, date_fin, cout
                INTO v_libele, v_date_debut, v_date_fin, v_cout
                FROM cout_variable
                WHERE id = ${resulId};

                -- Boucle sur chaque parcelle extraite
                FOR parc IN
                    SELECT TRIM(p) AS numero
                    FROM unnest(string_to_array((SELECT parcelle FROM cout_variable WHERE id =${resulId}), ',')) AS p
                LOOP
                    -- Récupérer l'id de la parcelle correspondante
                    SELECT id INTO parc_id FROM parcelles WHERE numero = parc LIMIT 1;

                    -- Insertion dans la table activite
                    INSERT INTO activite (
                        id, libele, data_debut, date_fin, date_enreg,
                        "date reception", sup_traitee, operateur, cout_fixe,
                        cout_variable, parcelle, document, annee_exercice,id_mission
                    )
                    VALUES (
                        r, v_libele, v_date_debut, v_date_fin, v_date_fin,
                        v_date_fin, (SELECT superficie FROM parcelles WHERE id=parc_id),
                        (SELECT nom_prenoms FROM agent WHERE id in(${id_agent}) LIMIT 1), 0,
                        ${cout_parcelle}, parc_id, 'Document', 2025, ${resulId}
                    );

                    -- Incrémenter l'identifiant
                    r := r + 1;
                END LOOP;
            END
            $$ LANGUAGE plpgsql;

            `
           const reponse = await client.query(insertquery);
            if (reponse.rows.length > 0) {
                console.log("Insertion dans la table activite réussie pour la mission ID ");
            }
            else {
                console.log("Aucune insertion effectuée dans la table activite pour la mission ID");
            }
        }
        console.log(result.rows[0]);
        return res.status(200).json(result.rows[0]);
        
            
      } else {
        return res.status(404).json({ message: 'Aucune donnée de coût variable trouvée.' });
      }
      
    } catch (error) {
      // Afficher l'erreur sur la console du serveur
      console.error('Erreur lors de la récupération du dernier coût variable:', error.message);
      
      // Utiliser un message d'erreur plus général pour le client
      return res.status(500).json({ message: 'Erreur du serveur interne lors de la récupération des données.' });
    }
});
  

//-----------------------Dashboard supervision-----------------------------------------
  app.get('/api/gest/:admin',authenticateToken,(req, res) => {
    const {tokenY} = req.user;
    res.render('dashboard_gest',{foret:req.params.foret,id:tokenY});

  });

 app.get('/api/get/gest/:annee/')

  app.get('/api/gest/:admin/mise_en_place',(req, res) => {
    
    res.render('dash_mise_en_place',{foret:req.params.foret});

  });

//----------------------------------Recuperer----------------------------------------------------

// API POST pour récupérer les données en fonction des forêts et des années
app.post('/api/donnees', async (req, res) => {
    const { foret, annees } = req.body; // Récupérer les données envoyées par le client
  
    // Vérifier si les données sont présentes
    if (!foret || !annees || annees.length === 0) {
      return res.status(400).json({ message: 'Forêt et années sont requis.' });
    }
  
    // Créer une chaîne de valeurs pour les années
    const anneesList = annees.map(annee => `${annee}`).join(',');
  
    try {
      // Construire la requête SQL pour récupérer les données des forêts et des années
      const query = `
        SELECT
            a.id,
            a.superficie,
            a.essence,
            a.partenaire,
            a.densite,
            a.numero,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret=ANY(ARRAY[${foret.map(f => `${f}`).join(',')}]) AND b.fk_cout_fixe = 1 THEN b.superficie_traitee ELSE 0 END), 0) AS rabattage,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret=ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])  AND b.fk_cout_fixe = 2 THEN b.superficie_traitee ELSE 0 END), 0) AS abattage,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret=ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])  AND b.fk_cout_fixe = 3 THEN b.superficie_traitee ELSE 0 END), 0) AS brulage,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret=ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])  AND b.fk_cout_fixe = 4 THEN b.superficie_traitee ELSE 0 END), 0) AS ouverture,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret=ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])  AND b.fk_cout_fixe = 5 THEN b.superficie_traitee ELSE 0 END), 0) AS piquetage,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret=ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])  AND b.fk_cout_fixe = 6 THEN b.superficie_traitee ELSE 0 END), 0) AS trouaison,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret=ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])  AND b.fk_cout_fixe = 7 THEN b.superficie_traitee ELSE 0 END), 0) AS planting,
            COALESCE((((SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret=ANY(ARRAY[${foret.map(f => `${f}`).join(',')}]) AND b.fk_cout_fixe BETWEEN 1 AND 7 THEN b.superficie_traitee ELSE 0 END))/(a.superficie*7))*100), 0) AS taux
        FROM parcelles a
        LEFT JOIN appliquer b ON a.id = b.fk_parcelles
        WHERE a.annee IN (${anneesList}) AND a.foret=ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])
        GROUP BY a.id
        ORDER BY a.id ASC;
      `;
      // Prépare la requête GET à envoyer
    const url = `http://localhost:${port}/api/donnees?foret=${foret}&annees=${annees}`;
    
    // Effectue une requête GET pour renvoyer les mêmes données
    const response = await axios.get(url);  // Envoie la requête GET avec les paramètres
  
      // Exécuter la requête SQL
      const result = await client.query(query);
  
      // Si des données sont trouvées, envoyer la réponse
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows);
        
        //---------------------------Requete graphiques ------------------------------------
      } else {
        return res.status(404).json({ message: 'Aucune donnée trouvée.' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête PostgreSQL:', error);
      return res.status(500).json({ message: 'Erreur du serveur interne' });
    }
  });

//----------------------------------------------------------------------------------------------

//-------------------------------Requete pour les graphiques------------------------------------

app.get('/api/donnees', async(req, res) => {
    // Récupérer les paramètres de la requête GET
    const foret = req.query.foret;  // Récupère le paramètre forêt
    const anneesList = req.query.annees;  // Récupère le paramètre années
    console.log(foret);
    console.log(anneesList);
  
    // Vérifier si les paramètres existent
    if (!foret || !anneesList) {
      return res.status(400).json({ message: 'Les paramètres forêts et années sont requis.' });
    }
    try{
        const query =  `
        SELECT
            a.id,
            a.superficie,
            a.essence,
            a.partenaire,
            a.densite,
            a.annee,
            a.foret,
            b.superficie_traitee as realise,
            a.numero,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret IN (${foret}) AND b.fk_cout_fixe = 1 THEN b.superficie_traitee ELSE 0 END), 0) AS rabattage,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret IN (${foret}) AND b.fk_cout_fixe = 2 THEN b.superficie_traitee ELSE 0 END), 0) AS abattage,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret IN (${foret}) AND b.fk_cout_fixe = 3 THEN b.superficie_traitee ELSE 0 END), 0) AS brulage,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret IN (${foret})  AND b.fk_cout_fixe = 4 THEN b.superficie_traitee ELSE 0 END), 0) AS ouverture,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret IN (${foret})  AND b.fk_cout_fixe = 5 THEN b.superficie_traitee ELSE 0 END), 0) AS piquetage,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret IN (${foret})  AND b.fk_cout_fixe = 6 THEN b.superficie_traitee ELSE 0 END), 0) AS trouaison,
            COALESCE(SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret IN (${foret})  AND b.fk_cout_fixe = 7 THEN b.superficie_traitee ELSE 0 END), 0) AS planting,
            COALESCE((((SUM(CASE WHEN a.annee IN (${anneesList}) AND a.foret IN (${foret}) AND b.fk_cout_fixe BETWEEN 1 AND 7 THEN b.superficie_traitee ELSE 0 END))/(a.superficie*7))*100), 0) AS taux
        FROM parcelles a
        LEFT JOIN appliquer b ON a.id = b.fk_parcelles
        WHERE a.annee IN (${anneesList}) AND a.foret IN (${foret})
        GROUP BY a.id, b.superficie_traitee
        ORDER BY a.id ASC;
      `;
        const response = await client.query(query);

        if (response.rows.length > 0) {
            return res.status(200).json(response.rows);
          } else {
            return res.status(404).json({ message: 'Aucune donnée trouvée.' });
          }
    } catch (error) {
        console.error('Erreur lors de l\'exécution de la requête PostgreSQL:', error); 
        return res.status(500).json({ message: 'Erreur du serveur interne' });
    }
  });

//---------------------------------------------------------------------------------------------

app.get('/api/parcelles', async (req, res) => {
    try {
      const result = await client.query(`SELECT a.id, a.annee, a.numero, a.essence, a.superficie, b.foret
         FROM parcelles AS a
		 INNER JOIN foret AS b ON a.foret = b.id ORDER BY a.annee ASC, a.numero ASC`);
      res.json(result.rows);
    } catch (err) {
      console.error('Erreur lors de l\'exécution de la requête:', err);
      res.status(500).send('Erreur serveur');
    }
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

app.post("/rejet/:tokenGen",(req,res)=>{
    let aleaToken = req.params.tokenGen;
    console.log(aleaToken);
    client.query(
        `UPDATE utilisateur SET statut = 'rejet'
        WHERE token like '${aleaToken}'`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
                client.query(
                    `SELECT * FROM utilisateur
                    WHERE token like '${aleaToken}'`,
                    (err, results) => {
                        if (err) {
                        console.log(err);
                        }else{
                            //-----------------------------------------
                            var transporteur = nodemailer.createTransport({
                                host: 'mail.privateemail.com',
                                port: 587,
                                secure: false,
                                auth:{
                                    user :"admin@gestreb.net",
                                    pass :"alphat_echno225"
                                }
                            });
                            var mailOptions={
                                from :"admin@gestreb.net",
                                to :results.rows[0].email ,
                                subject : `Reponse à la demande d'autorisation d'accès à la l'Application WebSig`,
                                text: `Bonjour M. (Mme) ${results.rows[0].prenom} ${results.rows[0].nom}, votre demande d'accès à la carte interactive a été rejétée. Veuillez vous rapprocher de la Direction du Centre de Gestion pour plus d'informations.`
                            };
                            transporteur.sendMail(mailOptions,(err,response)=>{
                                if(err){
                                    console.log("Erreur d'envoi du mail "+err);
                                }else{
                                    console.log("Mail envoyé avec succès !");
                                    res.redirect('/connexion');
                                };
                            });
                      };
                    });
            }
        });
    
});

app.post("/validation/:tokenGen",(req,res)=>{
    let aleaToken = req.params.tokenGen;
    console.log(aleaToken);
    client.query(
        `CREATE TABLE IF NOT EXISTS utilisateurs(prenom varchar (50),nom varchar(50),email varchar(50),
        contact varchar(50),matricule varchar(50),ugf varchar(50),mp varchar(1000),token varchar(50),statut varchar(50) etat varchar(50));
        `,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
            console.log('Base de données créés avec succès');
            }
        });
    client.query(
        `UPDATE utilisateur SET statut = 'valide'
        WHERE token like '${aleaToken}'`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
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
                                            `INSERT INTO utilisateurs (prenom,nom,email,contact,matricule,ugf,mp,token,administrateur)
                                                VALUES ($1, $2, $3,$4,$5,$6,$7,$8,'admin')
                                                RETURNING *`,
                                            [prenom,nom,email,contact,matricule,ugf,mp,token],
                                            (err, result) => {
                                            if (err) {
                                                console.log(err);
                                            }else{
                        
                                            //-----------------------------------------
                                            var transporteur = nodemailer.createTransport({
                                                host: 'mail.privateemail.com',
                                                port: 587,
                                                secure: false,
                                                auth:{
                                                    user :"admin@gestreb.net",
                                                    pass :"alphat_echno225"
                                                }
                                            });
                                            var mailOptions={
                                                from :"admin@gestreb.net",
                                                to :results.rows[0].email ,
                                                subject : `Reponse à la demande d'autorisation d'accès à la l'Application WebSig`,
                                                text: `Bonjour M. (Mme) ${results.rows[0].prenom} ${results.rows[0].nom}, votre demande d'accès à la carte interactive vient d'être acceptée. Vous pouvez vous connecter avec votre addresse emeil et votre mot de pass.\n vous pouvez vous connecter ici : https://gestreb.net/connexion`
                                            };
                                            transporteur.sendMail(mailOptions,(err,response)=>{
                                                if(err){
                                                    console.log("Erreur d'envoi du mail "+err);
                                                }else{
                                                    console.log("Mail envoyé avec succès !");
                                                    res.redirect('/connexion');
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
            }
})
    
    //---------------------!°°°!------------------------------
    
    //---------------------!°°°!------------------------------


    
});

app.post("/inscription",(req,res)=>{
    console.log(donnee_connect[donnee_connect.length-1])
    let { prenom, nom,email,contact,mat,ugf, mp, rp_mp } = req.body;
    
    let errors = [];
    
    console.log({
        prenom, nom,email,contact, mp, rp_mp
    });

    client.query(
        `CREATE TABLE IF NOT EXISTS utilisateur(prenom varchar (50),nom varchar(50),email varchar(50),
        contact varchar(50),matricule varchar(50),ugf varchar(50),mp varchar(1000),token varchar(50),statut varchar(50));
        `,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
            console.log('Base de données créés avec succès');
            }
        });

    if (!nom ||!prenom || !email ||!contact || !mp || !rp_mp) {
        errors.push({ message: "Veillez entrer une valeur" });
    }

    if (ugf.value =='') {
        errors.push({ message: "Vous devez choisir une UGF" });
    }
    
    if (mp.length < 8) {
        errors.push({ message: "Le mot de pass doit avoir au moins 8 charactères" });
    }
    
    if (mp !== rp_mp) {
        errors.push({ message: "Les mots de pass ne sont pas concordants" });
    }
    if (errors.length > 0) {
        req.flash("error",errors);
        res.redirect("/inscription");
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
                    `INSERT INTO utilisateur (prenom,nom,email,contact,matricule,ugf,mp,token,statut)
                        VALUES ($1, $2, $3,$4,$5,$6,$7,$8,'attente')
                        RETURNING *`,
                    [prenom,nom,email,contact,mat,ugf,hash,tokenGen],
                    (err, results) => {
                    if (err) {
                        console.log(err);
                    }else{

                    //-----------------------------------------
                        var transporteur = nodemailer.createTransport({
                            host: 'mail.privateemail.com',
                            port: 587,
                            secure: false,
                            auth:{
                                user :"admin@gestreb.net",
                                pass :"alpha_techno225"
                            }
                        });
                        var mailOptions={
                            from :"admin@gestreb.net",
                            to :"admin@gestreb.net" ,
                            subject : `Demande d'autorisation d'accès à la l'Application WebSig de ${nom} ${prenom}`,
                            text : `M.(Mme) ${nom} ${prenom} de matricule ${mat} en service à l'Unité de Gestion Forestière de ${ugf} joignable au ${contact} ou par email via ${email} souhaiterait avoir l'accès à la plateforme WebSig du centre de Gestion. Veillez cliquer sur ce lien pour valider sa demande.\n https://gestreb.net/valid/`+tokenGen
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
                    req.flash("success","Votre inscription a été prise en compte et est en cours de traitement. vous recevrez un e-mail incessament.");
                    res.redirect("/inscription");
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

app.post("/connexion",async (req,res)=>{
    //donnee_connect.length=0;

    const { email, mp } = req.body;

    

  try {
    const result = await client.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).send('Utilisateur non trouvé.');

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(mp, user.mp);
    if (!isMatch) return res.status(401).send('Mot de passe incorrect.');

    // Créer un JWT
    const accessToken = jwt.sign({ tokenY: user.token, email: user.email,ugf: user.ugf,admin: user.administrateur }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Stocker le token dans les cookies
    res.cookie('token', accessToken, { httpOnly: true });
    

    client.query(`SELECT etat FROM utilisateurs WHERE email like '${user.email}'`,(error,response)=>{
        if (error){
            console.log(error+" Aucune données")
        }else{
            if(response.rows.length>0){
                console.log("Données existentes");
                client.query(`UPDATE utilisateurs SET etat = 'connecte' WHERE email like '${user.email}'`,(err)=>{
                    if(!err){
                        console.log("Etat mise à jour avec succès, connecté");
                    }else{
                        console.log(err+ " Impossible de mettre à jour");
                    }
                })
            }else{
                console.log("Données vides");
                client.query(`INSERT INTO utilisateurs (etat) VALUES ('connecté')`,(err)=>{
                    if(!err){
                        console.log("Données insérées avec succès");
                    }else{
                        console.log(err+ " Impossible d'insérer les données");
                    }
                })
            }
            
        }
    });
    /*client.query(
        `CREATE TABLE IF NOT EXISTS stock (email varchar(100) data varchar(100);)`,
        (err, results) => {
            if (err) {
            console.log(err);
            }else{
            console.log('Base de données créés avec succès');
            }
        });*/

    client.query(`CREATE TABLE IF NOT EXISTS parcelles_${user.token} as (select * from parcelles)`,(err,response)=>{
        if(!err){
            client.query(`CREATE TABLE IF NOT EXISTS foret_${user.token} as (select * from foret)`,(err,response)=>{
                if(!err){
                    res.redirect(`/mise_en_place/${user.token}`); // Rediriger vers le tableau de bord
                }else{
                    console.log(err+" Erreur lors de la duplication de la base de données Foret")
                }
        
            })
        }else{
            console.log(err+" Erreur lors de la duplication de la base de données Parcelles")
        }

    })

  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur.');
  }
});

 app.get("/log/deconnecter",authenticateToken,(req,res)=>{
    const { tokenY } = req.user;
    const { email } = req.user;
    client.query(`SELECT etat FROM utilisateurs WHERE email like '${email}'`,(error,response)=>{
        if (error){
            console.log(error+" Aucune données")
        }else{
            if(response.rows.length>0){
                console.log("Données existentes");
                client.query(`UPDATE utilisateurs SET etat = 'deconnecte' WHERE email like '${email}'`,(err)=>{
                    if(!err){
                        console.log("Etat mise à jour avec succès, deconnecté");
                    }else{
                        console.log(err+ " Impossible de mettre à jour");
                    }
                })
            }else{
                console.log("Données vides");
                client.query(`INSERT INTO utilisateurs (etat) VALUES ('deconnecté')`,(err)=>{
                    if(!err){
                        console.log("Données insérées avec succès");
                    }else{
                        console.log(err+ " Impossible d'insérer les données");
                    }
                })
            }
            
        }
    });
    client.query(`DROP TABLE parcelles_${tokenY},foret_${tokenY}`,(err)=>{
        if(!err){
            console.log("Données de l'utilisateur effacées avec succès");
        }else{
            console.log("Une erreur s'est produite : "+err)
        }
    });
    setTimeout(()=>{
        res.clearCookie('token');
        res.redirect('/accueil');
    },3000)
});
let liste_element = [];
let result = [];
let donn_ref_requete=[];

app.post('/requete/:id',authenticateToken,(req,res)=>{
    const {email} = req.user;
    const {tokenY} = req.user;
    /*donn_ref_requete.length=0;
    result.length=0;
    var corresp = {"tene":1,"sangoue":2};
    var ddf = '(';
    for(let xl=0;xl<liste_element.length;xl++){
        if(xl<liste_element.length-1){
            ddf+=`${corresp[liste_element[xl]]},`;
        }else if (xl==liste_element.length-1){
            ddf+=`${corresp[liste_element[xl]]})`;
        }
    }*/
    tab_ddf = [];
    client.query(`SELECT * FROM stock WHERE email like '${email}'`,(error,response)=>{
        if (error){
            console.log(error+" Désolé, données non sélectionnées");
        }else{
            console.log("Donnees chargés avec succès");
            
            console.log(response.rows);
            console.log(response.rows[0]);
            console.log(response.rows[0].data);
            tab_ddf.push(response.rows[0].data);
            
        }
    });
    setTimeout(()=>{

    let ddf = tab_ddf[0];
    console.log(ddf);
    let {cocher,cocher2,cocher3,attributes,attributes2,attributes3,operator,operator2,operator3,
        value,value2,value3
    }=req.body;
    console.log(attributes2);
    if (cocher && cocher2 && cocher3){
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
        FROM (SELECT a.id,b.foret as Foret,a.annee as Annee,a.numero,a.essence as Essence,a.densite as Densité,a.partenaire as Partenaire,a.longitude as X,a.latitude as Y,
        a.superficie as Superficie,ST_Transform(geom, 4326)
        FROM public.parcelles_${tokenY} a  JOIN public.foret_${tokenY} b ON a.foret=b.id WHERE a.foret in ${ddf}
        and ${attributes} ${operator} ${value} ${clause1} ${attributes2} ${operator2} ${value2} ${clause2} ${attributes3} ${operator3} ${value3}) AS t`,
                (err,results)=>{
                if(!err){
                    console.log(results.rows[0].donnee)
                    fs.writeFile(`public/json/fichier-${tokenY}.geojson`,JSON.stringify(results.rows[0].donnee),'utf-8',(err)=>{
                        console.log(err);               
                        });
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
        let clause1 = 'AND';
        if (attributes==attributes2){
            clause1='OR';
        }else{
            clause1='AND';
        }
        client.query(`SELECT json_build_object('type', 'FeatureCollection','features',json_agg(ST_AsGeoJSON(t.*)::json) ) as donnee 
        FROM (SELECT a.id,b.foret as Foret,a.annee as Annee,a.numero,a.essence as Essence,a.densite as Densité,a.partenaire as Partenaire,a.longitude as X,a.latitude as Y,
        a.superficie as Superficie,ST_Transform(geom, 4326)
        FROM public.parcelles_${tokenY} a  JOIN public.foret_${tokenY} b ON a.foret=b.id WHERE a.foret in ${ddf}
        and ${attributes} ${operator} ${value} ${clause1} ${attributes2} ${operator2} ${value2}) AS t`,
                (err,results)=>{
                if(!err){
                    console.log(results.rows[0].donnee)
                    fs.writeFile(`public/json/fichier-${tokenY}.geojson`,JSON.stringify(results.rows[0].donnee),'utf-8',(err)=>{
                        console.log(err);               
                        });
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
        FROM (SELECT a.id,b.foret as Foret,a.annee as Annee,a.numero,a.essence as Essence,a.densite as Densité,a.partenaire as Partenaire,a.longitude as X,a.latitude as Y,
        a.superficie as Superficie,ST_Transform(geom, 4326)
        FROM public.parcelles_${tokenY} a  JOIN public.foret_${tokenY} b ON a.foret=b.id WHERE a.foret in ${ddf}
        and ${attributes} ${operator} ${value}) AS t`,
                (err,results)=>{
                if(!err){
                    console.log(results.rows[0].donnee)
                    fs.writeFile(`public/json/fichier-${tokenY}.geojson`,JSON.stringify(results.rows[0].donnee),'utf-8',(err)=>{
                        console.log(err);               
                        });
                }else{
                    console.log(err);
                }
                client.end;
    });
    }
    },2000)
    res.status(204).end();
})

app.post('/dashboard/00000/:id',authenticateToken,(req,res)=>{
    //result.length=0;
    //ALTER TABLE parcelles ALTER COLUMN foret TYPE integer USING foret::integer;

    /*
    do
$$
declare
     r integer;
begin
   for r in SELECT id FROM public.parcelles loop	
	INSERT INTO public.appliquer (fk_parcelles) VALUES (r);
   end loop;
end;
$$;

    */
    const { email } = req.user;
    const {tokenY} = req.user;
    liste_token.length=0
    var corresp = {"tene":1,"sangoue":2};
    
    /*fsExtra.emptyDirSync('public/json');
    if(count.length>0){
        count.length=0;
    }*/
    //let user_mail = req.session.email;
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
    
    client.query(`SELECT * FROM stock WHERE email like '${email}'`,(error,response)=>{
        if (error){
            console.log(error+" Désolé, données non sélectionnées")
        }else{
            if(response.rows.length>0){
                console.log("Données existentes");
                client.query(`UPDATE stock SET data = '${ddf}' WHERE email like '${email}'`,(err)=>{
                    if(!err){
                        console.log("Ddf mise à jour avec succès");
                    }else{
                        console.log(err+ " Impossible de mettre le Ddf à jour");
                    }
                })
            }else{
                console.log("Données vides");
                client.query(`INSERT INTO stock (email,data) VALUES ('${email}','${ddf}')`,(err)=>{
                    if(!err){
                        console.log("Données insérées avec succès");
                    }else{
                        console.log(err+ " Impossible d'insérer les données");
                    }
                })
            }
            
        }
    });

    console.log(ddf);
    client.query(`SELECT json_build_object('type', 'FeatureCollection','features',json_agg(ST_AsGeoJSON(t.*)::json) ) as donnee 
        FROM (SELECT a.id,b.foret as Foret,a.annee as Annee,a.numero,a.essence as Essence,a.densite as Densité,a.partenaire as Partenaire,a.longitude as X,a.latitude as Y,
        a.superficie as Superficie,ST_Transform(geom, 4326)
        FROM public.parcelles_${tokenY} a  JOIN public.foret_${tokenY} b ON a.foret=b.id WHERE a.foret in ${ddf}) AS t`,
                (err,results)=>{
                if(!err){
                    console.log(results.rows[0].donnee)
                    fs.writeFile(`public/json/fichier-${tokenY}.geojson`,JSON.stringify(results.rows[0].donnee),'utf-8',(err)=>{
                        console.log(err);               
                        });
                }else{
                    console.log(err);
                }
                client.end;
    });
    res.status(204).end();
    console.log(liste_choix);
    //let tokenT = token(10);
    liste_token.push(ddf);

});

app.post(`/page/init/:id`,(req,res)=>{
    res.redirect(`/page/${req.params.id}`);
})

app.get('/elements/elem/:id',authenticateToken,(req,res)=>{
    const { email } = req.user;
    setTimeout(()=>{client.query(`SELECT data FROM stock WHERE email like '${email}'`,(error,response)=>{
        if (error){
            console.log(error+" Désolé, données non sélectionnées")
        }else{
            console.log("Donnees envoyés avec succès");
            //result.push(response.rows[0].data);
            //console.log(response.rows[0].data);
            setTimeout(()=>{
                res.json(response.rows[0].data);
            },2000)
            
        }
    })
},3000);

    
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
