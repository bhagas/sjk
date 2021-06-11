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
router.get('/tenaga_kerja', cek_login, function(req, res) {
  connection.query("SELECT * from tenaga_kerja_balai where deleted=0", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_tenaga_kerja_balai/list', {data:rows}); 
});
});

router.get('/tenaga_kerja/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_tenaga_kerja_balai/insert'); 
});

router.get('/tenaga_kerja/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from tenaga_kerja_balai where id='"+req.params.id+"'", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_tenaga_kerja_balai/edit', {data:rows}); 
});
});

router.post('/tenaga_kerja/submit_insert', cek_login,  function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak.insert(post).into("tenaga_kerja_balai").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_profil_balai/tenaga_kerja'); 
});
});

router.post('/tenaga_kerja/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak("tenaga_kerja_balai").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_profil_balai/tenaga_kerja');
});
});

router.get('/tenaga_kerja/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update tenaga_kerja_balai SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_profil_balai/tenaga_kerja');
});


router.get('/perpustakaan', cek_login, function(req, res) {
  
  res.render('content-backoffice/manajemen_perpustakaan/list'); 

});

router.get('/perpustakaan/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_perpustakaan/insert'); 
});

router.get('/perpustakaan/edit/:id', cek_login, function(req, res) {
  
  res.render('content-backoffice/manajemen_perpustakaan/edit'); 

});




router.get('/tupoksi', cek_login, function(req, res) {
  connection.query("SELECT * from tupoksi where deleted=0", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_tupoksi/list',{data:rows}); 
});
});

router.get('/tupoksi/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_tupoksi/insert'); 
});

router.get('/tupoksi/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from tupoksi where id='"+req.params.id+"'", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_tupoksi/edit',{data:rows}); 
});
});

router.post('/tupoksi/submit_insert', cek_login,  function(req, res){
  var post = {}
 post = req.body;

if(req.files){

  if(req.files.file1){
   req.files.file1.mv('./public/foto/'+req.files.file1.name,(async err=>{
     
   }))
}
  post.file1= req.files.file1.name
}

    

  
    console.log(post)
   sql_enak.insert(post).into("tupoksi").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_profil_balai/tupoksi'); 
});
});

router.post('/tupoksi/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
 if(req.files){

  if(req.files.file1){
   req.files.file1.mv('./public/foto/'+req.files.file1.name,(async err=>{
     
   }))
}
  post.file1= req.files.file1.name
}
    console.log(post)
   sql_enak("tupoksi").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_profil_balai/tupoksi'); 
});
});


router.get('/tupoksi/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update tupoksi SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_profil_balai/tupoksi');
});
module.exports = router;
