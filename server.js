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

//ST_AsGeoJSON(ST_Transform(geom,4326)) as donnee

// Middleware pour vérifier le token JWT
function authenticateToken(req, res, next) {
    const token = req.cookies.token; // On récupère le token depuis les cookies
  
    if (!token) return res.redirect('/connexion'); // Si aucun token, rediriger vers la page de connexion
  
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) return res.redirect('/connexion'); // Token invalide, rediriger vers login
      req.user = user;
      next();
    });
  }



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
    res.redirect('/connexion');
});

app.get('/data',authenticateToken,(req,res)=>{
    res.json(control[0]);
    control=[];
    console.log();
});

/*app.get('/dashboard',(req,res)=>{
    res.render('page_accueil');
});*/
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
    const fonction = {'sangoue':2,'tene':1,'cg_gag':3,'csotc':4,'agent_sotc':5,'agent_tene':6,'agent_sangoue':7,'autre_sodefor':8};
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
    
    res.render('interface_cugf',{foret:req.params.foret});

  });
//-----------------------Dashboard supervision-----------------------------------------
  app.get('/api/gest/:administrateur',(req, res) => {
    
    res.render('dashboard_gest',{foret:req.params.foret});

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
        SELECT (SELECT SUM(objectif) AS objectif_1
        FROM resultats
        WHERE fk_foret = ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])
        AND annee IN (${anneesList})
        AND fk_activite=1),
        (SELECT SUM(objectif) AS objectif_2
        FROM resultats
        WHERE fk_foret = ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])
        AND annee IN (${anneesList})
        AND fk_activite BETWEEN 2 AND 5),
        (SELECT SUM(realise) AS realise_1
        FROM resultats
        WHERE fk_foret = ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])
        AND annee IN (${anneesList})
        AND fk_activite=1),
        (SELECT SUM(realise) AS realise_2
        FROM resultats
        WHERE fk_foret = ANY(ARRAY[${foret.map(f => `${f}`).join(',')}])
        AND annee IN (${anneesList})
        AND fk_activite BETWEEN 2 AND 5)
        FROM resultats LIMIT 1;
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
    const forets = req.query.foret;  // Récupère le paramètre forêt
    const annees = req.query.annees;  // Récupère le paramètre années
    console.log(forets);
    console.log(annees);
  
    // Vérifier si les paramètres existent
    if (!forets || !annees) {
      return res.status(400).json({ message: 'Les paramètres forêts et années sont requis.' });
    }
    try{
        const query = `
        SELECT (SELECT SUM(realise) FROM resultats WHERE fk_activite=1) as mise_en_place,
        (SELECT SUM(realise) FROM resultats WHERE fk_activite=2) as entretien_0,
        (SELECT SUM(realise) FROM resultats WHERE fk_activite=3) as entretien_1,
        (SELECT SUM(realise) FROM resultats WHERE fk_activite=4) as entretien_2,
        (SELECT SUM(realise) FROM resultats WHERE fk_activite=5) as entretien_3 
        FROM resultats WHERE annee IN (${annees}) AND fk_foret IN (${forets})
        LIMIT 1
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
      const result = await client.query('SELECT * FROM parcelles ORDER BY annee ASC');
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
                                service : "gmail",
                                auth:{
                                    user :"alphacodant@gmail.com",
                                    pass :"khwr jbvk vstt nyhe"
                                }
                            });
                            var mailOptions={
                                from :"alphacodant@gmail.com",
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
                                                    pass :"khwr jbvk vstt nyhe"
                                                }
                                            });
                                            var mailOptions={
                                                from :"alphacodant@gmail.com",
                                                to :results.rows[0].email ,
                                                subject : `Reponse à la demande d'autorisation d'accès à la l'Application WebSig`,
                                                text: `Bonjour M. (Mme) ${results.rows[0].prenom} ${results.rows[0].nom}, votre demande d'accès à la carte interactive vient d'être acceptée. Vous pouvez vous connecter avec votre addresse emeil et votre mot de pass.\n vous pouvez vous connecter ici : https://ci-sodefor-gagnoa-1.onrender.com/connexion`
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
                            service : "gmail",
                            auth:{
                                user :"alphacodant@gmail.com",
                                pass :"khwr jbvk vstt nyhe"
                            }
                        });
                        var mailOptions={
                            from :"alphacodant@gmail.com",
                            to :"alphacodant@gmail.com" ,
                            subject : `Demande d'autorisation d'accès à la l'Application WebSig de ${nom} ${prenom}`,
                            text : `M.(Mme) ${nom} ${prenom} de matricule ${mat} en service à l'Unité de Gestion Forestière de ${ugf} joignable au ${contact} ou par email via ${email} souhaiterait avoir l'accès à la plateforme WebSig du centre de Gestion. Veillez cliquer sur ce lien pour valider sa demande.\n https://ci-sodefor-gagnoa-1.onrender.com/valid/`+tokenGen
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
                    res.redirect(`/page/${user.token}`); // Rediriger vers le tableau de bord
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
        res.redirect('/connexion');
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
        FROM (SELECT a.id,b.nom as Foret,a.annee as Annee,a.numero,a.essence as Essence,a.densite as Densité,a.partenaire as Partenaire,a.longitude as X,a.latitude as Y,
        a.superficie as Superficie,ST_Transform(geom, 4326)
        FROM public.parcelles_${tokenY} a  JOIN public.foret_${tokenY} b ON a.foret=b.id WHERE a.foret in ${ddf}
        and ${attributes} ${operator} ${value} ${clause1} ${attributes2} ${operator2} ${value2} ${clause2} ${attributes3} ${operator3} ${value3} 
            ${clause3} ${attributes4} ${operator4} ${value4} ${clause4} ${attributes5} ${operator5} ${value5}) AS t`,
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
        FROM (SELECT a.id,b.nom as Foret,a.annee as Annee,a.numero,a.essence as Essence,a.densite as Densité,a.partenaire as Partenaire,a.longitude as X,a.latitude as Y,
        a.superficie as Superficie,ST_Transform(geom, 4326)
        FROM public.parcelles_${tokenY} a  JOIN public.foret_${tokenY} b ON a.foret=b.id WHERE a.foret in ${ddf}
        and ${attributes} ${operator} ${value} ${clause1} ${attributes2} ${operator2} ${value2} ${clause2} ${attributes3} ${operator3} ${value3} 
            ${clause3} ${attributes4} ${operator4} ${value4}) AS t`,
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
        FROM (SELECT a.id,b.nom as Foret,a.annee as Annee,a.numero,a.essence as Essence,a.densite as Densité,a.partenaire as Partenaire,a.longitude as X,a.latitude as Y,
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
        FROM (SELECT a.id,b.nom as Foret,a.annee as Annee,a.numero,a.essence as Essence,a.densite as Densité,a.partenaire as Partenaire,a.longitude as X,a.latitude as Y,
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
