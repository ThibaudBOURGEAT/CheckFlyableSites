const router = require('express').Router();
const Meteo = require('../../models/Meteo');
const http = require('http');
const mysql = require('mysql');
const db = require('../../../config');
const timer = 2 * 60 * 60 * 1000;

const getWeatherData = function(){
    db.query('SELECT * FROM sites',function(err,sites){
        var countRequest = 0;
        sites.forEach(async function(site){
            var url = "api.openweathermap.org";
            var options = {
                host: url,
                path: '/data/2.5/weather?lat='+site.lat+'&lon='+site.lon+'&appid='+process.env.API_KEY,
                method: 'POST'
            };
            await http.request(options, (resp) => {
                let body = '';
                resp.setEncoding('utf8');
                resp.on('data', (chunk) => {
                    body += chunk;
                    var datas = JSON.parse(body);
                    var flyable = checkIsFlyable(site, datas);
                    const newMeteo = new Meteo({
                        coord: { lon: datas.coord.lon, lat: datas.coord.lat },
                        weather: {  id: datas.weather[0].id,
                                    main: datas.weather[0].main,
                                    description: datas.weather[0].description },
                                    wind:{ speed: datas.wind.speed, deg: datas.wind.deg },
                                    flyable: flyable
                    });
                    newMeteo.save(function(err){
                        if(err) throw err;
                    });

                });
                resp.on('end', () => {
                    countRequest += 1;
                    console.log(countRequest);
                    if(countRequest == sites.length - 1){
                        console.log("Nombre de reqête enregistrées : " + (countRequest+1));
                    }
                });
            }).on('error', function(err){}).end();
        });
    });
}

const checkIsFlyable = function(site, datas){
    if(datas.weather[0].id >= 800 && datas.weather[0].id < 900){
        if(datas.wind.speed*3.6 < 35){
            return true;
        }
    }
    return false;
}

router.get('/getFlyable/:lon/:lat', function(req,res){
    Meteo.findOne({'coord.lon': req.params.lon, 'coord.lat': req.params.lat})
         .sort({date: -1})
         .then(function(meteo){
             if(meteo.flyable){res.json({message:"Vous pouvez voler !", success: meteo.flyable})}
             res.json({message:"Vous ne pouvez pas voler !", success: meteo.flyable});
         });
});

setInterval(getWeatherData, timer, 'meteo');

module.exports = router;
