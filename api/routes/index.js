const router = require('express').Router();

router.use('/sites', require('./sites'));
router.use('/meteo', require('./meteo'));

module.exports = router ;
