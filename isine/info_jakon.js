var connection = require('../database').connection;
var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , static = require('serve-static')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , path = require('path')
  ,  sha1 = require('sha1');
var sql_enak = require('../database/mysql_enak.js').connection;
var cek_login = require('./login').cek_login;
var cek_login_google = require('./login').cek_login_google;
var dbgeo = require("dbgeo");
var multer = require("multer");
var st = require('knex-postgis')(sql_enak);
path.join(__dirname, '/public/foto')
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: true }));

  router.use(cookieParser() );
  router.use(passport.initialize());
  router.use(passport.session());
  router.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/foto/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+'-'+file.originalname)
  }
})

var upload = multer({ storage: storage })

//start-------------------------------------
router.get('/tenaga_kerja', function(req, res) {
  connection.query("SELECT a.ska, b.kab from tenaga_kerja a join kabupaten b on a.id_kab = b.id_kab where deleted=0", function(err, ska, fields) {
    connection.query("SELECT a.skt, b.kab from tenaga_kerja a join kabupaten b on a.id_kab = b.id_kab where deleted=0", function(err, skt, fields) {
  connection.query("SELECT * from tenaga_kerja a join kabupaten b on a.id_kab = b.id_kab where deleted=0", function(err, tenaga_kerja, fields) {

  res.render('content/info_tenaga_kerja', {data_ska:ska, data_skt:skt, data_tenaga_kerja:tenaga_kerja}); 
  // res.json({data_ska:ska, data_skt:skt,data_tenaga_kerja:tenaga_kerja})
});
});
});
});

router.get('/badan_usaha', function(req, res) {
  res.render('content/info_badan_usaha'); 
});

router.get('/profil_pembinaan', function(req, res) {
  res.render('content/info_profil_pembinaan'); 
});

router.get('/profil_balai', function(req, res) {
  connection.query("SELECT * from tenaga_kerja_balai where deleted=0", function(err, rows, fields) {
  res.render('content/info_profil_balai', {data:rows}); 
});
});

module.exports = router;
