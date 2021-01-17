var connection = require('../database').connection;
var express = require('express');
var router = express.Router();
const del = require('del')
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
  const importExcel= require('convert-excel-to-json')

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
router.get('/proyek', cek_login, function(req, res) {
  connection.query("SELECT * from master_proyek where deleted=0", function(err, rows, fields) {
    if (err) throw err;
  res.render('content-backoffice/manajemen_master_proyek/list', {data:rows});
  }) 
});

router.get('/proyek/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_master_proyek/insert'); 
});

router.get('/proyek/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from master_proyek where id='"+req.params.id+"'", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_master_proyek/edit',{data:rows});
  }) 
});

router.post('/proyek/submit_insert', cek_login,  function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak.insert(post).into("master_proyek").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/proyek'); 
});
});

router.post('/proyek/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak("master_proyek").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/proyek');
});
});

router.get('/proyek/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update master_proyek SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_master/proyek');
});



router.get('/divisi', cek_login, function(req, res) {
  connection.query("SELECT a.*, b.nama_proyek from master_divisi a join master_proyek b on a.id_proyek = b.id where a.deleted=0", function(err, rows, fields) {
    if (err) throw err;
  res.render('content-backoffice/manajemen_master_divisi/list', {data:rows});
  }) 
});

router.get('/divisi/insert', cek_login, function(req, res) {
  connection.query("SELECT * from master_proyek where deleted=0", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_master_divisi/insert', {data:rows}); 
  })
});

router.get('/divisi/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from master_divisi where id='"+req.params.id+"'", function(err, rows, fields) {
    connection.query("SELECT * from master_proyek where deleted=0", function(err, proyek, fields) {
  res.render('content-backoffice/manajemen_master_divisi/edit', {data:rows, data_proyek:proyek});
    })
  }) 
});

router.post('/divisi/submit_insert', cek_login,  function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak.insert(post).into("master_divisi").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/divisi'); 
});
});

router.post('/divisi/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak("master_divisi").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/divisi');
});
});

router.get('/divisi/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update master_divisi SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_master/divisi');
});



router.get('/pekerjaan', cek_login, function(req, res) {
  connection.query("SELECT a.* from master_pekerjaan a  where a.deleted=0", function(err, rows, fields) {
    if (err) throw err;
  res.render('content-backoffice/manajemen_master_pekerjaan/list',{data:rows});
  }) 
});

router.get('/pekerjaan/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_master_pekerjaan/insert'); 
});

router.get('/pekerjaan/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from master_pekerjaan where id='"+req.params.id+"'", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_master_pekerjaan/edit', {data:rows});
  
  }) 
});

router.get('/pekerjaan/detail/:id', cek_login, function(req, res) {
  connection.query("SELECT * from master_pekerjaan where id='"+req.params.id+"'", function(err, rows, fields) {
    connection.query("SELECT * from standar_harga ", function(err, rowss, fields) {
      connection.query("SELECT a.*, b.nama, b.satuan, b.kode from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id where a.id_pekerjaan =  '"+req.params.id+"'", function(err, data_detail_pekerjaan, fields) {
        // console.log(data_detail_pekerjaan)
        res.render('content-backoffice/manajemen_master_pekerjaan/detail', {data:rows, data_bahan: rowss, data_detail_pekerjaan});
        
        }) 
      
      }) 
  
  }) 
});

router.get('/pekerjaan/detail_json/:id/:id_kab', cek_login, function(req, res) {
    connection.query("SELECT a.*, b.nama, b.satuan, b.kode, c.harga from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+req.params.id+"' join standar_harga_kab c on a.id_standar_harga = c.id_standar_harga and c.id_kab = '"+req.params.id_kab+"'", function(err, data_detail_pekerjaan, fields) {
      // console.log("SELECT a.*, b.nama, b.satuan, b.kode from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+req.params.id+"' join standar_harga_kab c on a.id_standar_harga = c.id and c.id_kab = '"+req.params.id_kab+"'") 
      res.json(data_detail_pekerjaan)
        }) 
      
    
});

router.get('/pekerjaan/list_json/:id_kab', cek_login, function(req, res) {
   connection.query("SELECT a.*, b.harga  from standar_harga a join standar_harga_kab b on a.id = b.id_standar_harga and b.id_kab =  '"+req.params.id_kab+"'", function(err, data, fields) {
        // console.log(data_detail_pekerjaan)
        res.json( {data});
        
        }) 
      
     
});

router.get('/pekerjaan/detail/:id', cek_login, function(req, res) {
  connection.query("SELECT * from master_pekerjaan where id='"+req.params.id+"'", function(err, rows, fields) {
  res.render('content-backoffice/manajemen_master_pekerjaan/edit', {data:rows});
  
  }) 
});

router.post('/pekerjaan/detail/tambah', cek_login,  function(req, res){
  var post = {}
 post = req.body;
    let x = {};
    x.id_pekerjaan = post.id_pekerjaan;
    x.id_standar_harga = post.id_standar_harga;
    x.jenis_uraian = post.jenis_uraian;
    x.koefisien = post.koefisien;
   sql_enak.insert(x).into("detail_pekerjaan").then(function (id) {
  console.log(id);
  res.json({id})
})


});

router.get('/pekerjaan/detail/hapus/:id', cek_login,  function(req, res){
 
  connection.query("DELETE FROM detail_pekerjaan WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
    //  if (err) throw err;
      numRows = rows.affectedRows;
      res.json({jumlah: numRows})
    })
});

router.post('/pekerjaan/submit_insert', cek_login,  function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak.insert(post).into("master_pekerjaan").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/pekerjaan'); 
});
});

router.post('/pekerjaan/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak("master_pekerjaan").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/pekerjaan');
});
});

router.get('/pekerjaan/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update master_pekerjaan SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_master/pekerjaan');
});




router.get('/detail_pekerjaan/import', cek_login, function(req, res) {
  connection.query("SELECT * from kabupaten ", function(err, kabupaten, fields) {
  res.render('content-backoffice/manajemen_master_detail_pekerjaan/insert', {kabupaten});
    
  }) 
});

router.get('/detail_pekerjaan/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from detail_pekerjaan where id='"+req.params.id+"'", function(err, rows, fields) {
    connection.query("SELECT * from master_divisi where deleted=0", function(err, divisi, fields) {
      connection.query("SELECT * from master_pekerjaan where deleted=0", function(err, pekerjaan, fields) {
  res.render('content-backoffice/manajemen_master_detail_pekerjaan/edit', {data:rows, data_divisi:divisi, data_pekerjaan:pekerjaan}); 
      })
    })
  })
});

router.post('/detail_pekerjaan/submit_insert', cek_login,  function(req, res){
  console.log(req.body)
  let file = req.files.file_ssh;
        let namafile = Date.now() + file.name
        

        file.mv('./public/excel/'+namafile,(async err=>{
            if(err){
                res.json(err)
            }
            else{
                let result =  await importExcel({
                    sourceFile :'./public/excel/'+namafile,
                    header     :   {rows:1},
                    columnToKey:{A:'id_standar_harga',F:'harga'},
                    sheets :['standar_harga']
                    
                });
                // console.log(result)

                var hasil = result.standar_harga.map(function(el) {
                    var o = Object.assign({}, el);
                    o.id_kab = req.body.id_kab;
                  
                    return o;
                  })
                  // console.log(hasil)
                  if(hasil.length){
                    connection.query("DELETE FROM standar_harga_kab where id_kab='"+req.body.id_kab+"'", function(err, rows, fields) {
                      sql_enak('standar_harga_kab').insert(hasil)
                      .then(data=>{
                          del(['./public/excel/'+namafile])
                         res.redirect('/list_ssh')
                      })
                      .catch(err=>{
                        console.log(err, 'err')
                          res.json(err)
                      })
                    })
                  
                  }else{
                    res.json({pesan: 'File Salah'})
                  }
                 
                
                
            }
        }))
});

router.post('/detail_pekerjaan/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak("detail_pekerjaan").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/detail_pekerjaan');
});
});

router.get('/detail_pekerjaan/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update detail_pekerjaan SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_master/detail_pekerjaan');
});


module.exports = router;
