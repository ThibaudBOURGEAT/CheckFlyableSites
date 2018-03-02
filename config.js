const dotenv = require('dotenv');
const mongoose = require('mongoose');
const mysql = require('mysql');

dotenv.config();

mongoose.connect('mongodb://' + process.env.DB_HOST +
                 ':' + process.env.DB_PORT +
                 '/' + process.env.DB_NAME);

const connection = mysql.createConnection({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWD,
    database : process.env.MYSQL_DB
});

connection.connect(function(err) {
    if (err) throw err;
    console.log('Connected to MySQL');
});

module.exports = connection;
