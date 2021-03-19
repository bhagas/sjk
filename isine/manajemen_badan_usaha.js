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
  var deasync = require('deasync');
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
router.get('/jasa_pelaksana', cek_login, function(req, res) {
  connection.query("SELECT a.*, b.kab from jasa_pelaksana a join kabupaten b on a.id_kab = b.id_kab where deleted=0", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_jasa_pelaksana/list',{data:rows}); 
});
});

router.get('/jasa_pelaksana/insert', cek_login, function(req, res) {
  connection.query("SELECT * from kabupaten ", function(err, kabupaten, fields) {

  res.render('content-backoffice/manajemen_jasa_pelaksana/insert',{kabupaten}); 
});
});

router.get('/jasa_pelaksana/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from jasa_pelaksana where id='"+req.params.id+"'", function(err, rows, fields) {
    connection.query("SELECT * from kabupaten ", function(err, kabupaten, fields) {
  res.render('content-backoffice/manajemen_jasa_pelaksana/edit', {data:rows,kabupaten}); 
});
});
});

router.post('/jasa_pelaksana/submit_insert', cek_login,  function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak.insert(post).into("jasa_pelaksana").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_badan_usaha/jasa_pelaksana'); 
});
});

router.post('/jasa_pelaksana/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak("jasa_pelaksana").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_badan_usaha/jasa_pelaksana');
});
});

router.get('/jasa_pelaksana/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update jasa_pelaksana SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_badan_usaha/jasa_pelaksana');
});





router.get('/jasa_perencana', cek_login, function(req, res) {
  connection.query("SELECT a.*, b.kab from jasa_perencana a join kabupaten b on a.id_kab = b.id_kab where deleted=0", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_jasa_perencana/list',{data:rows}); 
});
});

router.get('/jasa_perencana/insert', cek_login, function(req, res) {
  connection.query("SELECT * from kabupaten ", function(err, kabupaten, fields) {

  res.render('content-backoffice/manajemen_jasa_perencana/insert',{kabupaten}); 
});
});

router.get('/jasa_perencana/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from jasa_perencana where id='"+req.params.id+"'", function(err, rows, fields) {
    connection.query("SELECT * from kabupaten ", function(err, kabupaten, fields) {
  res.render('content-backoffice/manajemen_jasa_perencana/edit', {data:rows,kabupaten}); 
});
});
});

router.post('/jasa_perencana/submit_insert', cek_login,  function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak.insert(post).into("jasa_perencana").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_badan_usaha/jasa_perencana'); 
});
});

router.post('/jasa_perencana/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak("jasa_perencana").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_badan_usaha/jasa_perencana');
});
});

router.get('/jasa_perencana/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update jasa_pelaksana SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_badan_usaha/jasa_perencana');
});

module.exports = router;
