const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require("./config.js");
const db = require("./config");
const contents = fs.readFileSync("decollages.json");
const jsonContent = JSON.parse(contents);
const app = express();

app.use(bodyParser.json());
app.use('/api', require('./api'));

app.listen(process.env.PORT, function() {
  console.log('Le serveur répond sur le port: '+ process.env.PORT);
});

app.get('/mysql/init', function(req,res){
    for(var i=0; i< jsonContent.sites.site.length; i++){
        var values = [];
        values.push([Number(jsonContent.sites.site[i]._identifiant),
                            jsonContent.sites.site[i].nom,
                            jsonContent.sites.site[i].codepostal._value,
                            jsonContent.sites.site[i].coord._lat,
                            jsonContent.sites.site[i].coord._lon]);
        db.query('INSERT INTO sites (identifiant, name, zipcode, lat, lon) VALUES ?', [values], function(err,result) {
            if(err) throw (err);
        });
        if(jsonContent.sites.site[i].orientations){
            jsonContent.sites.site[i].orientations.orientation.forEach(function(elem){
                db.query('INSERT IGNORE INTO orientations (orientation) VALUES (?)', elem._value, function(err,result) {
                    if(err) throw err;
                });
            });
        }
        if(jsonContent.sites.site[i].pratiques){
            jsonContent.sites.site[i].pratiques.pratique.forEach(function(elem){
                db.query('INSERT IGNORE INTO pratiques (name) VALUES (?)', elem._value, function(err,result) {
                    if(err) throw err;
                });
            });
        }
    }
    jsonContent.sites.site.forEach(function(site){
            db.query('SELECT id FROM sites WHERE `name` = ?',
                             [site.nom],
                              function(err,result){
                                  if(err) throw err;
                                  if(site.orientations){
                                      site.orientations.orientation.forEach(function(elem){
                                          db.query({sql: 'SELECT id FROM orientations WHERE `orientation` = ?',
                                          values: [elem._value]},
                                          function(err,orientation){
                                              if(err) throw err;
                                              var values = [];
                                              values.push([result[0].id, orientation[0].id]);
                                              db.query('INSERT INTO sites_orientations (id_site, id_orientation) VALUES ?',
                                              [values],
                                              function(err,result) {
                                                  if(err) throw err;
                                              });
                                          });
                                      });
                                  }
                              });
    });
    jsonContent.sites.site.forEach(function(site){
            db.query('SELECT id FROM sites WHERE `name` = ?',
                             [site.nom],
                              function(err,result){
                                  if(err) throw err;
                                  if(site.pratiques){
                                      site.pratiques.pratique.forEach(function(elem){
                                          db.query({sql: 'SELECT id FROM pratiques WHERE `name` = ?',
                                          values: [elem._value]},
                                          function(err,pratique){
                                              if(err) throw err;
                                              var values = [];
                                              values.push([result[0].id, pratique[0].id]);
                                              db.query('INSERT INTO sites_pratiques (id_site, id_pratique) VALUES ?',
                                              [values],
                                              function(err,result) {
                                                  if(err) throw err;
                                              });
                                          });
                                      });
                                  }
                              });
    });
    res.json('Insert success');
});
