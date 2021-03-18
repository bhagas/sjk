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
  const axios = require('axios');
  const fs = require('fs');
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
  connection.query("select * from kabupaten", function(err, kabupaten, fields) {
    res.render('content-backoffice/manajemen_backup/list', {kabupaten});
    
  })
});

router.get('/list_json/:id_kab', cek_login, function(req, res) {
  connection.query("select a.*, b.kab from arsip a join kabupaten b on a.id_kab = b.id_kab WHERE a.id_kab="+req.params.id_kab, function(err, data, fields) {
    res.json({data})
  })
});

router.get('/arsip/:id_kab/:tahun/:triwulan', cek_login, async function(req, res){
  //hsd
  try{
  let pekerjaan = await  axios.get('http://localhost:8862/manajemen_master/pekerjaan/list_json/'+req.params.id_kab)
  let upah = await  axios.get('http://localhost:8862/manajemen_master/pekerjaan/list_json_upah/'+req.params.id_kab)
  let peralatan = await  axios.get('http://localhost:8862/manajemen_master/pekerjaan/list_json_peralatan/'+req.params.id_kab)
     // handle success
     let hasil = pekerjaan.data.data
    //  console.log(hasil.data)
     hasil =  hasil.concat(upah.data.data);
     hasil =  hasil.concat(peralatan.data.data);
     let data = JSON.stringify(hasil, null, 2);
     fs.writeFileSync(`./public/arsip/HSD-${req.params.id_kab}-${req.params.tahun}-${req.params.triwulan}.json`, data);
     // console.log(response);
    //  res.sendStatus(200);






    //hspk
     data=[]
     data =  await sql_enak.raw("SELECT a.* from master_pekerjaan a ");
    
      data = data[0];
      // console.log(data[0])
      for(let index =0 ; index < data.length; index++){

        data[index].total = 0
     
        let data_harga=  await sql_enak.select(sql_enak.raw(" a.*, b.nama, b.satuan, b.kode, MIN(c.harga) as harga from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+data[index].id+"' join standar_harga_kab c on a.id_standar_harga = c.id_standar_harga and c.id_kab = '"+req.params.id_kab+"' group by a.id"));
        // console.log("SELECT a.*, b.nama, b.satuan, b.kode, MIN(c.harga) as harga from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+item.id+"' join standar_harga_kab c on a.id_standar_harga = c.id_standar_harga and c.id_kab = '"+req.params.id_kab+"' group by a.id")
     
        data[index].list = data_harga;
        // console.log(data[index].list);
        data_harga.forEach(function(harga_item){
          data[index].total += harga_item.harga * harga_item.koefisien;
        })
        data[index].profit = (data[index].total * 15)/100;
        data[index].total_keseluruhan = data[index].total + data[index].profit;
       
       }
       console.log(data);
       let dataa = JSON.stringify(data, null, 2);
       
       fs.writeFileSync(`./public/arsip/HSPK-${req.params.id_kab}-${req.params.tahun}-${req.params.triwulan}.json`, dataa);
     
       await sql_enak.raw(`DELETE from arsip where id_kab = ${req.params.id_kab} and tahun = ${req.params.tahun} and triwulan = ${req.params.triwulan} `)
      
      
     await sql_enak.insert({
        id_kab : req.params.id_kab,
        tahun : req.params.tahun,
        triwulan : req.params.triwulan,
        hsd : 1,
        hspk : 1,
      }).into("arsip")

      res.json({status:200});
    }catch(err){
      console.log(err, 'aaaax')
      res.json({status: err})
    }
  });
  
  // router.get('/hspk/:id_kab/:tahun/:triwulan', function(req, res) {
  //   let done = false;
  //   let data=[]
  //   connection.query("SELECT a.* from master_pekerjaan a ", function(err, data_detail_pekerjaan, fields) {
  //     // console.log("SELECT a.*, b.nama, b.satuan, b.kode from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+req.params.id+"' join standar_harga_kab c on a.id_standar_harga = c.id and c.id_kab = '"+req.params.id_kab+"'") 
  //    data = data_detail_pekerjaan
  //       done = true;
  //     }) 
  //     deasync.loopWhile(function(){return !done;});
  
  //     data.forEach(function(item, index){
  //       done = false;
  //       data[index].total = 0
  //      connection.query("SELECT a.*, b.nama, b.satuan, b.kode, MIN(c.harga) as harga from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+item.id+"' join standar_harga_kab c on a.id_standar_harga = c.id_standar_harga and c.id_kab = '"+req.params.id_kab+"' group by a.id", function(err, data_harga, fields) {
  //       //  console.log(data_harga);
  //        data[index].list = data_harga;
  //        data_harga.forEach(function(harga_item){
  //          data[index].total += harga_item.harga * harga_item.koefisien;
  //        })
  //        done = true;
  //      }) 
  //       deasync.loopWhile(function(){return !done;});
  //       data[index].profit = (data[index].total * 15)/100;
  //       data[index].total_keseluruhan = data[index].total + data[index].profit;
  //      })
  //      let dataa = JSON.stringify(data, null, 2);
  //      fs.writeFileSync(`./public/arsip/HSPK-${req.params.id_kab}-${req.params.tahun}-${req.params.triwulan}.json`, dataa);
     
  //      res.sendStatus(200);
  
  // });

router.get('/insert', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_backup/insert'); 
});

router.get('/edit/:id', cek_login, function(req, res) {
  res.render('content-backoffice/manajemen_backup/edit'); 
});

router.get('/download/:id_kab/:tahun/:triwulan', cek_login, function(req, res) {
  let hspk = fs.readFileSync(`./public/arsip/HSPK-${req.params.id_kab}-${req.params.tahun}-${req.params.triwulan}.json`);
  hspk = JSON.parse(hspk);
  let hsd = fs.readFileSync(`./public/arsip/HSD-${req.params.id_kab}-${req.params.tahun}-${req.params.triwulan}.json`);
  hsd = JSON.parse(hsd);
  connection.query("select * from kabupaten where id_kab="+req.params.id_kab, function(err, kabupaten, fields) {
    res.render('content-backoffice/notifikasi/buku_jakon',{hspk, hsd, kabupaten});   
  })
 
});

module.exports = router;
