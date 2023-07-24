const express = require('express')
const { lstat, cp } = require('fs')
const mysql = require('mysql')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const db = mysql.createConnection({ host: "localhost", user: "wilfried_bour", password: "will" , database: "challenkers"})
const cors = require('cors');
const axios = require('axios')
app.use(cors());


app.listen(8000, (res) => {
    console.log('Serveur lancé sur le port 8000')
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données Challenkers!');
    const favcitation = 'favicitation';
    const citation = 'citation';
    const checkTableQuery = `
        SELECT COUNT(*) AS count FROM information_schema.tables
        WHERE table_schema = ? AND table_name = ?
    `;

    db.query(checkTableQuery, [db.config.database, citation], (err, result) => {
        if (err) {
            console.error('Erreur lors de la vérification de la table :', err);
        } else {
            const tableExists = result[0].count === 1;
            if (tableExists) {
                console.log(`La table ${citation} existe déjà !`);
            } else {
                const createTableQuery = `
                    CREATE TABLE citation (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        citation VARCHAR(255),
                        author VARCHAR(255)
                    )
                `;

                db.query(createTableQuery, (err, result) => {
                    if (err) {
                        console.error('Erreur lors de la création de la table "citation" :', err);
                    } else {
                        console.log('La table "citation" a été créée avec succès !');
                    }
                });
            }
        }
    })

    db.query(checkTableQuery, [db.config.database, favcitation], (err, result) => {
        if (err) {
            console.error('Erreur lors de la vérification de la table :', err);
        } else {
            const tableExists = result[0].count === 1;
            if (tableExists) {
                console.log(`La table ${favcitation} existe déjà !`);
            } else {
                const createTableQuery = `
                    CREATE TABLE favcitation (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        citation VARCHAR(10000),
                        author VARCHAR(255),
                        episode VARCHAR(255)
                    )
                `;

                db.query(createTableQuery, (err, result) => {
                    if (err) {
                        console.error('Erreur lors de la création de la table "favcitation" :', err);
                    } else {
                        console.log('La table "facitation" a été créée avec succès !');
                    }
                });
            }
        }
    })

});
            
        
        
        




    app.get('/api/citations', (req, res) => {
        const selectQuery = 'SELECT * FROM citation';
    
        db.query(selectQuery, (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération des données:', err);
                res.status(500).json({ erreur: 'Erreur lors de la récupération des données.' });
            } else {
                console.log('Données récupérées avec succès :', result);
                res.status(200).json(result);
            }
        });
    });

    

    app.get("/api/random", async (req, res) => {
        try {
          const response = await axios.get("https://kaamelott.chaudie.re/api/random");
          res.json(response.data);
        } catch (error) {
          console.error("Error fetching data:", error.message);
          res.status(500).json({ error: "Error fetching data" });
        }
      });

    app.get("/citation/random", (req, res) => {
        const selectQuery = 'SELECT * FROM citation ORDER BY RAND() LIMIT 1';
    
        db.query(selectQuery, (err, result) => {
            if (err) {
                console.error('Erreur lors de la récupération des données:', err);
                res.status(500).json({ erreur: 'Erreur lors de la récupération des données.' });
            } else {
                console.log('Données récupérées avec succès :', result);
                res.status(200).json(result);
            }
        });
    })

    app.post("/citation", (req, res) => {
        const { citation } = req.body;
        const query = `INSERT INTO citation (citation, author) VALUES ("${citation}", "User")`;

        db.query(query, (err, result) => {
            if(err){
                console.error("L'insertion en base citation n'a pas fonctionné");
                res.status(500).json({ erreur: "L'insertion en base citation n'a pas fonctionné" });
            }
            else{
                console.log('Citation ajouté dans la table citation:', result);
                res.status(200).json(result);
            }
        })
    })

    app.post("/favoris/create", (req, res) => {
        const { episode, citation, auteur} = req.body;
        console.log(episode);
        console.log(auteur);
        console.log(citation);
        const addfav = `INSERT INTO favcitation (citation,episode,author) VALUES ("${citation}",  "${episode}", "${auteur}")`;

        db.query(addfav, (err, result) => {
            if(err){
                console.error("L'insertion dans la base favcitation n'a pas fonctionné", err);
                res.status(500).json({ erreur: "L'insertion en base favcitation n'a pas fonctionné" });
            }
            else{
                console.log('La citatiton a été ajouté dans vos favoris', result);
                res.status(200).json(result);
            }
        })
    })

    app.post("/favoris/delete", (req, res) => {
        const { citation } = req.body;
        console.log("Test validé");
        const removefav = `DELETE from favcitation WHERE citation = "${citation}"`;
        db.query(removefav, (err, result) => {
            if(err){
                console.error("Suppression non effectuée" , err);
                res.status(500).json({ erreur: "Suppression non effectuée"});
            }
            else{
                console.log("La citation a bien été supprimé de vos favoris", result);
                res.status(200).json(result);
            }
        })
    })

    app.post("/citation/delete", (req, res) => {
        const { id } = req.body;
        const removeCitation = `DELETE from citation WHERE id = ${id}`;

        db.query(removeCitation, (err, result) => {
            if(err){
                console.error("Suppression non effectuée" , err);
                res.status(500).json({ erreur: "Suppression non effectuée"});
            }

            else{
                console.log("La citation a bien été supprimé", result);
                res.status(200).json(result);
            }
        })
    })

    app.post("/citation/update", (req, res) => {
        const { id, citation} = req.body;
        console.log(id);
        const updatedCitation = citation.citation[id];
        console.log(updatedCitation);
        
        const update = `UPDATE citation SET citation="${updatedCitation}" WHERE id=${id}`

        db.query(update, (err, result) => {
            if(err){
                console.error("Modification non effectuée", err);
                res.status(200).json({ erreur: "Modification non effectuée"});
            }

            else{
                console.log("La citation a bien été modifié", result);
                res.status(200).json(result);
            }
        })
    })

    app.post("/citation/recherche", (req, res)=> {
        const { value } = req.body;
        const recherche = `SELECT citation from citation WHERE citation Like ${value}%`

        db.query(recherche, (err, result) => {
            if(err){
                console.error("Nous n'avons rien trouvé");
                res.status(200).json({ erreur : "Nous n'avons rien trouvé"})
            }
            else{
                console.log("Voici les résultats", result);
                res.status(200).json(result);
            }
        })
    })












