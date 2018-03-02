const router = require('express').Router();
const db = require('../../../config');

router.get('/getSite/:id',function(req, res){
    db.query('SELECT * FROM sites where id = ?', [req.params.id], function(err, result){
        if(err) throw err;
        res.json(result);
    });
});

router.get('/getAllSites',function(req, res){
    db.query('SELECT * FROM sites', function(err, results){
        if(err) throw err;
        res.json(results);
    });
});

router.post('/createSite', function(req, res){
    db.query('SELECT identifiant FROM sites ORDER BY identifiant DESC', function(err, identifiants, fields){
        if(err) throw err;
        var identifiant = identifiants[0].identifiant + 1;
        var values = [
            identifiant,
            req.body.name,
            req.body.zipcode,
            req.body.lat,
            req.body.lon
        ];
        db.query('INSERT INTO sites (identifiant, name, zipcode, lat, lon) VALUES (?)', [values], function(err,result) {
            if(err) throw (err);
        });
        db.query('SELECT id FROM sites WHERE `name` = ?',
            [req.body.name],
            function(err,result){
                if(err) throw err;
                req.body.orientations.orientation.forEach(function(elem){
                db.query({sql: 'SELECT id FROM orientations WHERE `orientation` = ?',
                    values: [elem._value]},
                    function(err, orientation){
                        if(err) throw err;
                        var values = [result[0].id, orientation[0].id];
                        db.query('INSERT INTO sites_orientations (id_site, id_orientation) VALUES (?)',
                            [values],
                            function(err,result) {
                                if(err) throw err;
                            });
                    });
            });
        });
        db.query('SELECT id FROM sites WHERE `name` = ?',
            [req.body.name],
            function(err,result){
                if(err) throw err;
                req.body.pratiques.pratique.forEach(function(elem){
                db.query({sql: 'SELECT id FROM pratiques WHERE `name` = ?',
                    values: [elem._value]},
                    function(err, pratique){
                        if(err) throw err;
                        var values = [result[0].id, pratique[0].id];
                        db.query('INSERT INTO sites_pratiques (id_site, id_pratique) VALUES (?)',
                            [values],
                            function(err,result) {
                                if(err) throw err;
                            });
                    });
            });
            res.json('Insert success');
        });
    });
});

router.delete('/deleteSite', function(req, res){
    db.query('DELETE FROM sites WHERE id = ?', [req.body.id], function(err, result){
        if(err) throw err;
        res.json(result);
    });
});

router.put('/updateSite', function(req, res){
    var values = [
        req.body.name,
        req.body.zipcode,
        req.body.lat,
        req.body.lon,
        req.body.id
    ];
    db.query('UPDATE sites SET name=?,zipcode=?,lat=?,lon=? WHERE id = ?', values, function(err, result){
        if(err) throw err;
        res.json(result);
    });
});

module.exports = router;
