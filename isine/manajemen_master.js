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
  const XLSX = require('xlsx');
  const fs = require('fs');
  const axios = require('axios');
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
router.get('/toko', cek_login, function(req, res) {
  connection.query("SELECT a.*, b.kab from master_toko a join kabupaten b on a.id_kab = b.id_kab where deleted=0", function(err, rows, fields) {

  res.render('content-backoffice/manajemen_master_toko/list',{data:rows});
});
});

router.get('/toko/insert', cek_login, function(req, res) {
  connection.query("SELECT * from kabupaten ", function(err, kabupaten, fields) {
    res.render('content-backoffice/manajemen_master_toko/insert', {kabupaten});
      
    }) 
 
});

router.get('/toko/edit/:id', cek_login, function(req, res) {
  connection.query("SELECT * from master_toko where id='"+req.params.id+"'", function(err, rows, fields) {
    connection.query("SELECT * from kabupaten ", function(err, kabupaten, fields) {
      res.render('content-backoffice/manajemen_master_toko/edit', {data:rows,kabupaten});
        
      }) 
   
});
});

router.post('/toko/submit_insert', cek_login,  function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak.insert(post).into("master_toko").then(function (id) {
  console.log(id);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/toko'); 
});
});

router.post('/toko/submit_edit', cek_login, function(req, res){
  var post = {}
 post = req.body;
    console.log(post)
   sql_enak("master_toko").where("id", req.body.id)
  .update(post).then(function (count) {
 console.log(count);
})
.finally(function() {
  //sql_enak.destroy();
  res.redirect('/manajemen_master/toko');
});
});

router.get('/toko/delete/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update master_toko SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/manajemen_master/toko');
});






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

router.get('/pekerjaan/detail_json/:id/:id_kab', function(req, res) {
  // "SELECT a.*, MIN(b.harga) as hargaMin from standar_harga a left join standar_harga_kab b on a.id = b.id_standar_harga and b.id_kab = "+req.params.id_kab+" group by a.nama"
    connection.query("SELECT a.*, b.nama, b.satuan, b.kode, MIN(c.harga) as harga from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+req.params.id+"' join standar_harga_kab c on a.id_standar_harga = c.id_standar_harga and c.id_kab = '"+req.params.id_kab+"' group by a.id", function(err, data_detail_pekerjaan, fields) {
      // console.log("SELECT a.*, b.nama, b.satuan, b.kode from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+req.params.id+"' join standar_harga_kab c on a.id_standar_harga = c.id and c.id_kab = '"+req.params.id_kab+"'") 
      res.json(data_detail_pekerjaan)
        }) 
});





router.get('/pekerjaan/list/:id_kab', function(req, res) {
  let done = false;
  let data=[]
  connection.query("SELECT a.* from master_pekerjaan a where a.deleted =0; ", function(err, data_detail_pekerjaan, fields) {
    // console.log("SELECT a.*, b.nama, b.satuan, b.kode from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+req.params.id+"' join standar_harga_kab c on a.id_standar_harga = c.id and c.id_kab = '"+req.params.id_kab+"'") 
   data = data_detail_pekerjaan
      done = true;
    }) 
    deasync.loopWhile(function(){return !done;});

   
    res.json({data})

});

router.get('/pekerjaan/list_arsip/:id_kab', function(req, res) {
  let done = false;
  let data=[]
  connection.query("SELECT a.* from arsip a where a.id_kab="+req.params.id_kab+" ORDER BY a.tahun DESC, a.triwulan DESC limit 1", function(err, data_detail_pekerjaan, fields) {
    // console.log("SELECT a.*, b.nama, b.satuan, b.kode from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+req.params.id+"' join standar_harga_kab c on a.id_standar_harga = c.id and c.id_kab = '"+req.params.id_kab+"'") 
  // console.log(data_detail_pekerjaan)
    if(data_detail_pekerjaan.length>0){
    let hspk = fs.readFileSync(`./public/arsip/HSPK-${data_detail_pekerjaan[0].id_kab}-${data_detail_pekerjaan[0].tahun}-${data_detail_pekerjaan[0].triwulan}.json`);
    data = JSON.parse(hspk);
   }
      done = true;
    }) 
    deasync.loopWhile(function(){return !done;});

   
    res.json({data})

});

router.get('/pekerjaan/detail_satuan/:id/:id_kab', function(req, res) {
  let done = false;
  let data={}

      data.total = 0
     connection.query("SELECT a.*, b.nama, b.satuan, b.kode, MIN(c.harga) as harga from detail_pekerjaan a join standar_harga b on a.id_standar_harga = b.id and a.id_pekerjaan =  '"+req.params.id+"' join standar_harga_kab c on a.id_standar_harga = c.id_standar_harga and c.id_kab = '"+req.params.id_kab+"' group by a.id", function(err, data_harga, fields) {
      //  console.log(data_harga);
        data.list = data_harga;
       data_harga.forEach(function(harga_item){
         data.total += harga_item.harga * harga_item.koefisien;
       })
       done = true;
     }) 
      deasync.loopWhile(function(){return !done;});
      data.profit = (data.total * 10)/100;
      data.total_keseluruhan = data.total + data.profit;
   
    res.json({data})

});

router.get('/pekerjaan/list_json/:id_kab', function(req, res) {
  let done= false;
  let result =[]
  if(req.params.id_kab!='-'){
    connection.query("SELECT a.*, MIN(b.harga) as hargaMin from standar_harga a left join standar_harga_kab b on a.id = b.id_standar_harga and b.id_kab = "+req.params.id_kab+" and b.harga >0 group by a.nama", function(err, data, fields) {
      // console.log(data_detail_pekerjaan)
      
      result = data;
      done = true;
      
      })   
      require('deasync').loopWhile(function(){return !done;});
  }
  

          // result.forEach(function(item, index){
          //   done = false
          //   connection.query("SELECT a.harga, b.nama_toko  from standar_harga_kab a join master_toko b on a.id_toko = b.id where a.id_standar_harga="+item.id, function(err, data, fields) {
          //     // console.log(data_detail_pekerjaan)
          //     result[index].hargaSurvey= data
          //     result[index].hargaMin= Math.min.apply(Math, data.map(function(o) { return o.harga; }))
          //     // data.forEach(function(itemm,idx){
          //     //     result[index]
          //     // })
          //     // console.log(data)
          //     done = true;
              
          //     })   
          //     require('deasync').loopWhile(function(){return !done;});
          // })
        // console.log(result)
        res.json({data: result})
});

router.get('/pekerjaan/detail_toko/:id_standar_harga/:id_kab', function(req, res) {
  let done= false;
  let result =[]


     
            connection.query("SELECT a.harga, b.nama_toko  from standar_harga_kab a join master_toko b on a.id_toko = b.id where a.id_kab="+req.params.id_kab+" and a.id_standar_harga="+req.params.id_standar_harga, function(err, data, fields) {
              // console.log(data_detail_pekerjaan)
              result= data
              // result.hargaMin= Math.min.apply(Math, data.map(function(o) { return o.harga; }))
              // data.forEach(function(itemm,idx){
              //     result[index]
              // })
              // console.log(data)
              done = true;
              
              })   
              require('deasync').loopWhile(function(){return !done;});
        
        // console.log(result)
        res.json({data: result})
});

router.get('/pekerjaan/list_json_upah/:id_kab', function(req, res) {
  if(req.params.id_kab!="-"){
    connection.query("SELECT a.*, MIN(b.harga) as hargaMin from standar_harga a left join standar_harga_kab b on a.id = b.id_standar_harga  and b.id_kab = "+req.params.id_kab+" where a.kategori='TENAGA KERJA' and b.harga>0 group by a.nama", function(err, data, fields) {
      // console.log(data_detail_pekerjaan)
      res.json( {data});
      
      })  
  }else{
      res.json({data:[]})
  }
   
});

router.get('/pekerjaan/list_json_peralatan/:id_kab', function(req, res) {
  if(req.params.id_kab!="-"){
    connection.query("SELECT a.*, MIN(b.harga) as hargaMin from standar_harga a left join standar_harga_kab b on a.id = b.id_standar_harga  and b.id_kab = "+req.params.id_kab+" where a.kategori='PERALATAN' and b.harga>0 group by a.nama", function(err, data, fields) {
      // console.log(data_detail_pekerjaan)
      res.json( {data});
      
      })  
  }else{
      res.json({data:[]})
  }  
});

// router.get('/pekerjaan/list_json_front/:id_kab', cek_login, function(req, res) {
//   connection.query("SELECT a.*, b.harga  from standar_harga a join standar_harga_kab b on a.id = b.id_standar_harga and b.id_kab =  '"+req.params.id_kab+"'", function(err, data, fields) {
//        res.json( {data});
       
//        }) 
     
    
// });

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
                    header     :   {rows:8},
                    columnToKey:{A:'id_standar_harga',F:'harga'},
                    sheets :['Harga Dasar']
                    
                });
                // console.log(result)

                var hasil = result['Harga Dasar'].map(function(el) {
                    var o = Object.assign({}, el);
                    o.id_kab = req.body.id_kab;
                    o.id_toko = req.body.id_toko;

                    // let array1 = [];

                    // if(o.harga_kab>0){
                    //   array1.push(o.harga_kab)
                    // }
                    // if(o.harga_survey_1>0){
                    //   array1.push(o.harga_survey_1)
                    // }
                    // if(o.harga_survey_2>0){
                    //   array1.push(o.harga_survey_2)
                    // }
                    // o.harga = Math.min(...array1)
                    // console.log(Math.min(2, 3, 1));
                    return o;
                  })
                  // console.log(hasil)
                  if(hasil.length){
                    connection.query("DELETE FROM standar_harga_kab where id_kab='"+req.body.id_kab+"' and id_toko='"+req.body.id_toko+"'", function(err, rows, fields) {

                      sql_enak('standar_harga_kab').insert(hasil)
                      .then(async data=>{
                        let t = await del(['./public/excel/*.xlsx'])
                        console.log(t, 'aaa')  
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
router.get('/detail_pekerjaan/export_excel/:id_kab', async function(req,res){
  var workbook = XLSX.readFile('./public/excel/temp.xlsx');
  var first_sheet_name = workbook.SheetNames[3];
  var worksheet = workbook.Sheets['D'];


  const columnA = Object.keys(worksheet).filter(x => /^AG\d+/.test(x)).map(x => { return {kolom: x,data: worksheet[x].v}}) 

// console.log(columnA)
let harga= await sql_enak.raw("SELECT b.id_standar_harga, MIN(b.harga) as hargaMin from standar_harga_kab b where b.id_kab = "+req.params.id_kab+" and b.harga>0 group by b.id_standar_harga  ")
 harga = harga[0]
for(let i =1; i < columnA.length;i++){
  for(let a =1; a < harga.length;a++){
    // console.log(harga[a].id_standar_harga, columnA[i].data)
      if(harga[a].id_standar_harga==columnA[i].data){
        worksheet[columnA[i].kolom.replace("G", "H")].v = harga[a].hargaMin;
        XLSX.utils.sheet_add_aoa(worksheet, [[harga[a].hargaMin]], {origin: columnA[i].kolom.replace("G", "H")});
      }
  }
  }
  // XLSX.utils.book_append_sheet(workbook, worksheet, first_sheet_name);
  // res.json({nama: first_sheet_name, ws: worksheet})
  // var hsbgn = workbook.Sheets['HSBGN'];
  // console.log(hsbgn)

  var wbbuf = XLSX.write(workbook, {
    type: 'base64'
  });

      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], ['Content-Disposition',  "attachment; filename= HSBGN.xlsx"]]);
    // res.writeHead(200, [['Content-Disposition',  "attachment; filename=" + "HSDMaster.xlsx"]]);
    res.end( new Buffer(wbbuf, 'base64') );



   XLSX.writeFileAsync( './public/excel/temp.xlsx',workbook, function(err){
    // res.json(ambil_excel(req.params.id_kab))
   });




  
})

function ambil_excel(id_kab){
    //mulai membaca
    var hsbgn_workbook = XLSX.readFile('./public/excel/temp'+id_kab+'.xlsx');
    // var hsbgn_name = workbook.SheetNames[4];
    var hsbgn = hsbgn_workbook.Sheets['HSBGN'];
    // console.log(hsbgn)
    // res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], ['Content-Disposition',  "attachment; filename= HSBGN.xlsx"]]);
    // res.writeHead(200, [['Content-Disposition',  "attachment; filename=" + "HSDMaster.xlsx"]]);
    // res.end( new Buffer(wbbuf, 'base64') );
    let data=[];
  
    data[0]= {};
    
    data[0].gts = 0;
    data[0].gs = 0;
    data[0].tipea = 0;
    data[0].tipeb = 0;
    data[0].tipec = 0;
    data[0].pgndepan = 0;
    data[0].pgnbelakang = 0;
    data[0].pgnsamping = 0;
    data[0].prndepan = 0;
    data[0].prnbelakang = 0;
    data[0].prnsamping = 0;
  
  if(hsbgn['B10'].v){
  
    data[0].gts = hsbgn['B10'].v;
    data[0].gs = hsbgn['D10'].v;
    data[0].tipea = hsbgn['C14'].v;
    data[0].tipeb = hsbgn['C14'].v;
    data[0].tipec = hsbgn['D14'].v;
    data[0].pgndepan = hsbgn['B19'].v;
    data[0].pgnbelakang = hsbgn['C19'].v;
    data[0].pgnsamping = hsbgn['D19'].v;
    data[0].prndepan = hsbgn['B24'].v;
    data[0].prnbelakang = hsbgn['C24'].v;
    data[0].prnsamping = hsbgn['D24'].v;
  }
  return data;
}
router.get('/detail_pekerjaan/export_excel/:id_kab/:id_toko', cek_login, async function(req,res){
  /* original data */

      var data = []
      var ws_name = "Harga Dasar";
      var done = false;
      connection.query(`SELECT  b.id, b.kategori, b.jenis, b.nama, b.satuan, a.harga FROM standar_harga_kab a right join standar_harga b on a.id_standar_harga = b.id and a.id_kab = ${req.params.id_kab} and a.id_toko  = ${req.params.id_toko} `, function(err, rows, fields) {
          // console.log(rows)
          rows.forEach(function(item){
            (!item.harga)?item.harga=0:item.harga;
            // id kategori	KATEGORI BAHAN	id jenis	JENIS BAHAN	id nama	NAMA BAHAN	SATUAN	HARGA	KETERANGAN
            data.push({"ID": item.id, "KATEGORI BAHAN": item.kategori,"JENIS BAHAN": item.jenis,"NAMA BAHAN": item.nama,"SATUAN": item.satuan, "HARGA": item.harga, "KETERANGAN":''})
          })
          done = true;
      })
      require('deasync').loopWhile(function(){return !done;});
      var workbook = XLSX.readFile('./public/excel/temp_hsd.xlsx');
      // var first_sheet_name = workbook.SheetNames[3];
      var worksheet = workbook.Sheets[ws_name];
      // let ws = XLSX.utils.aoa_to_sheet(data, {origin: "A9"});
      
      /* add worksheet to workbook */
      // XLSX.utils.book_append_sheet(wb, ws, ws_name);
      // XLSX.utils.sheet_add_aoa(worksheet, [data], {origin: "A9"});
      // console.log(data)
   
      var done = false;
      let toko ="";
      connection.query(`SELECT  a.nama_toko, b.kab, a.alamat FROM master_toko a  join kabupaten b on a.id_kab = b.id_kab where  a.id  = ${req.params.id_toko} `, function(err, rows, fields) {
          // console.log(rows)
        toko = rows
          done = true;
      })
      require('deasync').loopWhile(function(){return !done;});
      var d = new Date();

      XLSX.utils.sheet_add_aoa(worksheet, [["TAHUN : "+d.getFullYear()]], {origin: "A4"});
      XLSX.utils.sheet_add_aoa(worksheet, [["DAERAH : "+toko[0].kab]], {origin: "A5"});
      XLSX.utils.sheet_add_aoa(worksheet, [["NAMA TOKO : "+toko[0].nama_toko]], {origin: "A6"});
      XLSX.utils.sheet_add_aoa(worksheet, [["ALAMAT : "+toko[0].alamat]], {origin: "A7"});
      XLSX.utils.sheet_add_json(worksheet, data, {header:["ID","KATEGORI BAHAN","JENIS BAHAN","NAMA BAHAN","SATUAN","HARGA","KETERANGAN"], origin: "A8"});

      var wbbuf = XLSX.write(workbook, {
        type: 'base64'
      });
      XLSX.writeFileAsync( './public/excel/temp_hsd.xlsx',workbook, function(err){
        // res.json(ambil_excel(req.params.id_kab))
       });
      res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], ['Content-Disposition',  "attachment; filename=" + ""+toko[0].kab+"-"+toko[0].nama_toko+".xlsx"]]);
      // res.writeHead(200, [['Content-Disposition',  "attachment; filename=" + "HSDMaster.xlsx"]]);
      res.end( new Buffer(wbbuf, 'base64') );
      // res.send(200)

})

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
