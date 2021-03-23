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
router.get('/', cek_login, function(req, res) {
  connection.query("SELECT a.*, b.kab from profil_pembinaan_jakon a join kabupaten b on a.id_kab = b.id_kab where deleted=0", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_pembina/list', {data:rows}); 
});
});

router.get('/insert', cek_login, function(req, res) {
  connection.query("SELECT * from kabupaten ", function(err, kabupaten, fields) {
  res.render('content-backoffice/manajemen_pembina/insert', {kabupaten}); 
});
});

router.get('/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from profil_pembinaan_jakon where id='"+req.params.id+"'", function(err, rows, fields) {
    connection.query("SELECT * from kabupaten ", function(err, kabupaten, fields) {
  res.render('content-backoffice/manajemen_pembina/edit', {data:rows, kabupaten}); 
});
});
});

router.post('/submit_insert', cek_login,  function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak.insert(post).into("profil_pembinaan_jakon").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_pembina'); 
});
});

router.post('/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak("profil_pembinaan_jakon").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_pembina');
});
});

router.get('/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update profil_pembinaan_jakon SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_pembina');
});


router.get('/susunan_tpjk/:id', cek_login, function(req, res) {
  connection.query("SELECT id from profil_pembinaan_jakon where id='"+req.params.id+"'", function(err, rows, fields) {
    connection.query("SELECT * from tpjk where deleted=0 and id_pembina='"+req.params.id+"'", function(err, data_tpjk, fields) {
  res.render('content-backoffice/manajemen_pembina/susunan_tpjk',{data:rows, tpjk:data_tpjk}); 
  // res.json({data:rows})
});
});
});


router.post('/susunan_tpjk/submit_insert', cek_login,  function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak.insert(post).into("tpjk").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_pembina/susunan_tpjk/'+post.id_pembina); 
});
});

router.get('/susunan_tpjk/delete/:id/:id_pembina', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update tpjk SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_pembina/susunan_tpjk/'+req.params.id_pembina);
});
module.exports = router;
