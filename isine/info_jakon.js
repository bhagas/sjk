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
  //select a.kab as label, (sum(b.gedung)+sum(b.sipil)+sum(b.mekanikal)+sum(b.lainnya)+sum(b.spesialis)+sum(b.keterampilan)) as y from kabupaten a left join jasa_pelaksana b on a.id_kab = b.id_kab group by a.id_kab
  connection.query("select a.kab as label, a.id_kab, (sum(b.gedung)+sum(b.sipil)+sum(b.mekanikal)+sum(b.lainnya)+sum(b.spesialis)+sum(b.keterampilan)) as y from kabupaten a left join jasa_pelaksana b on a.id_kab = b.id_kab group by a.id_kab", function(err, pelaksana, fields) {
    connection.query("select a.kab as label, (sum(b.arsitektur)+sum(b.rekayasa)+sum(b.penataan_ruang)+sum(b.p_arsitektur)+sum(b.p_rekayasa)+sum(b.p_penataan_ruang)+sum(b.spesialis)+sum(b.lainnya)) as y from kabupaten a left join jasa_perencana b on a.id_kab = b.id_kab group by a.id_kab", function(err, perencana, fields) {
      res.render('content/info_badan_usaha', {pelaksana, perencana}); 
    });
  });
 
});

router.get('/jumlah_badan_usaha/:id_kab', function(req, res) {
  //select a.kab as label, (sum(b.gedung)+sum(b.sipil)+sum(b.mekanikal)+sum(b.lainnya)+sum(b.spesialis)+sum(b.keterampilan)) as y from kabupaten a left join jasa_pelaksana b on a.id_kab = b.id_kab group by a.id_kab
  connection.query("select * from jasa_pelaksana where id_kab="+req.params.id_kab, function(err, pelaksana, fields) {
    connection.query("select * from jasa_perencana where id_kab="+req.params.id_kab, function(err, perencana, fields) {
      res.json({pelaksana, perencana})
    });
  });
 
});

router.get('/profil_pembinaan', function(req, res) {
  connection.query("SELECT * from kabupaten", function(err, kabupaten, fields) {
    res.render('content/info_profil_pembinaan', {kabupaten}); 
  });

});

router.get('/profil_balai', function(req, res) {
  connection.query("SELECT * from tenaga_kerja_balai where deleted=0", function(err, rows, fields) {
  connection.query("SELECT * from buku_perpus", function(err, data_buku, fields) {
    connection.query("SELECT * from tupoksi where deleted=0", function(err, data_tupoksi, fields) {

  res.render('content/info_profil_balai', {data:rows, buku : data_buku, tupoksi : data_tupoksi}); 
});
});
});
});


router.get('/profil_pembinaan_json/:id_kab', function(req, res) {
  let data =[]
  connection.query("SELECT * from profil_pembinaan_jakon where deleted=0 and id_kab="+req.params.id_kab, function(err, rows, fields) {
    data= rows;
    if(rows.length>0){
      connection.query("SELECT * from tpjk where id_pembina="+rows[0].id, function(err, rowss, fields) {
        data[0].tpjk=rowss;
        res.json({data})
      });
    }else{
      res.json({data})
    }
   

});
});

module.exports = router;
