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
router.get('/hsd', function(req, res) {
  connection.query("select * from kabupaten", function(err, kabupaten, fields) {
    res.render('content/hsd', {kabupaten});
    
  })
});

router.get('/hspk', function(req, res) {
  connection.query("select * from kabupaten", function(err, kabupaten, fields) {
      res.render('content/hspk', {kabupaten});
      
    
  })

});

router.get('/hspk_binamarga', function(req, res) {
  connection.query("select * from kabupaten", function(err, kabupaten, fields) {
      res.render('content/hspk_binamarga', {kabupaten});
      
    
  })

});


router.get('/hspk_psda', function(req, res) {
  res.render('content/hspk_psda');

});

router.get('/hspk_umum', function(req, res) {
  res.render('content/hspk_umum');

});

router.get('/hsgbn', function(req, res) {
  connection.query("select * from kabupaten", function(err, kabupaten, fields) {
    connection.query("select a.*, b.kab from hsbgn a join kabupaten b on a.id_kab=b.id_kab where a.deleted =0", function(err, data, fields) {
      res.render('content/hsgbn', {kabupaten, data});
      
    
  })
    // res.render('content/hsgbn', {kabupaten});
    
  
})

});

module.exports = router;
