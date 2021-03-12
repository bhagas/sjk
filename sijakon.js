var express = require('express')
  , http = require('http')
  , path = require('path')
  , logger = require('morgan')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , static = require('serve-static')
  , errorHandler =require('errorhandler')
  , passport = require('passport')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , flash=require("connect-flash")
  , LocalStrategy = require('passport-local').Strategy;
  var deasync = require('deasync');
var login = require('./isine/login').router;
var peta = require('./isine/topojson');
var upload = require('./isine/upload_file');
var upload_shp = require('./isine/upload_shp');
var user = require('./isine/user');
var fn = require('./isine/ckeditor-upload-image');
var cek_login = require('./isine/login').cek_login;
var berita = require('./isine/berita');
var harga_satuan = require('./isine/harga_satuan');
var peraturan = require('./isine/peraturan');
var info_jakon = require('./isine/info_jakon');
var manajemen_master = require('./isine/manajemen_master');
var manajemen_master_ssh = require('./isine/manajemen_master_ssh');
var manajemen_backup = require('./isine/manajemen_backup');
var sql_enak = require('./database/mysql_enak.js').connection;
const uploadd = require('express-fileupload')
var app = express();
var connection = require('./database').connection;
//var mysql2geojson = require("mysql2geojson");
var router = express.Router();
var dbgeo = require("dbgeo");
app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


//end dbf dan shp
// all environments
app.set('port', process.env.PORT || 8862);

//app.use(express.favicon());
app.use(function (req, res, next) {

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
app.use(uploadd())
app.use(logger('dev'));
app.use(methodOverride());
app.use(static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser() );
app.use(session({duration: 50 * 60 * 1000,
                      activeDuration: 10 * 60 * 1000,
                       secret: 'bhagasitukeren', 
                       cookie: { maxAge : 60 * 60 * 1000 },
                       cookieName: 'session',
                       saveUninitialized: true,
                        resave: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());  
// Add headers

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}
 var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));  
});
// var io = require('socket.io').listen(server, { log: false });
// testing wa
// const { Client } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
// const fs = require('fs');
// const SESSION_FILE_PATH = './session.json';

// // Load the session data if it has been previously saved
// let sessionData;
// if(fs.existsSync(SESSION_FILE_PATH)) {
//     sessionData = require(SESSION_FILE_PATH);
// }
// const client = new Client({
//   session: sessionData
// });

// client.on('qr', (qr) => {
//     // Generate and scan this code with your phone
//     qrcode.generate(qr, {small: true});
//     console.log('QR RECEIVED', qr);
// });
// // Save session values to the file upon successful auth
// client.on('authenticated', (session) => {
//   sessionData = session;
//   fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
//       if (err) {
//           console.error(err);
//       }
//   });
// });

// client.on('ready', () => {
//     console.log('Client is ready!');
//     client.sendMessage("6281215540280@c.us",'test dari server')
// });

// client.on('message', msg => {
//     if (msg.body == '!ping') {
//         msg.reply('pong');
//     }
// });



// client.initialize();
//mulai apps ----------------------------------------------------------



app.use('/autentifikasi', login);
app.use('/peta', peta);
app.use('/upload', upload);
app.use('/upload_shp', upload_shp);
app.use('/user', user);
app.use('/uploadckeditor', fn);

app.use('/berita', berita);
app.use('/harga_satuan', harga_satuan);
app.use('/peraturan', peraturan);
app.use('/info_jakon', info_jakon);
app.use('/manajemen_master', manajemen_master);
app.use('/manajemen_master_ssh', manajemen_master_ssh);
app.use('/manajemen_backup', manajemen_backup);


app.get('/' , function (req, res) {
  connection.query("select * from kabupaten", function(err, kabupaten, fields) {
    connection.query("select * from master_pekerjaan", function(err, pekerjaan, fields) {
      res.render('content/index', {kabupaten, pekerjaan});
      
    })
    
  })
});
app.get('/download_manual', function (req, res) {
 
  res.render('content-backoffice/notifikasi/download');
});

app.get('/backoffice', cek_login, function (req, res) {
  console.log(req.user)
  res.render('content-backoffice/index');
});
app.get('/list_ssh', cek_login, function (req, res) {
  connection.query("select * from kabupaten", function(err, kabupaten, fields) {
    res.render('content-backoffice/manajemen_master_detail_pekerjaan/list_ssh', {kabupaten});
    
  })

});

app.get('/list_toko/:id_kab', cek_login, function (req, res) {
  connection.query("select * from master_toko where id_kab="+req.params.id_kab, function(err, kabupaten, fields) {
    res.json(kabupaten)
    
  })

});

app.get('/simulasi', cek_login, function (req, res) {
  connection.query("select * from kabupaten", function(err, kabupaten, fields) {
    connection.query("select * from master_pekerjaan", function(err, pekerjaan, fields) {
      res.render('content-backoffice/manajemen_master_detail_pekerjaan/simulasi', {kabupaten, pekerjaan});
      
    })
    
  })

});
app.get('/delete_rab/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update input_rab SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/list_rab');
});
app.get('/kritik_saran', cek_login, function (req, res) {
  console.log(req.user)
  connection.query("select * from kritik_saran where deleted = 0", function(err, rows, fields) {
    res.render('content-backoffice/manajemen_master_detail_pekerjaan/kritik_saran', {data: rows});
    
  })

});
app.get('/delete_kritik_saran/:id', cek_login, function(req, res) {
  
  // senjata
  // console.log(req.params.id)
  connection.query("update kritik_saran SET deleted=1 WHERE id='"+req.params.id+"' ", function(err, rows, fields) {
  //  if (err) throw err;
    numRows = rows.affectedRows;
  })

  res.redirect('/kritik_saran');
});
app.get('/cetak_rab/:id_rab', function (req, res) {
 // console.log(req.body);
 var tampil = {};

  var done = false;
  connection.query("select * from input_rab where id="+req.params.id_rab, function(err, rows, fields) {
    tampil = rows;
    done = true;
    
  })
  deasync.loopWhile(function(){return !done;});


  var done = false;
  connection.query("select nama_divisi, id from master_divisi where id_proyek='1' and deleted = 0", function(err, rows, fields) {
    tampil[0].divisi = rows;
    done = true;
    
  })
  deasync.loopWhile(function(){return !done;});

  //perulangan divisi
  for(var i = 0; i< tampil[0].divisi.length; i++){

    var done = false;
    connection.query("select * from master_pekerjaan where id_divisi='"+tampil[0].divisi[i].id+"' and deleted = 0", function(err, rows, fields) {
      tampil[0].divisi[i].pekerjaan = rows;
      done = true;
      
    })
    deasync.loopWhile(function(){return !done;});
   
    for(var c = 0; c< tampil[0].divisi[i].pekerjaan.length; c++){
      var total_pekerjaan = 0;
      var harga_satuan = 0;
      var volume = tampil[0].panjang * tampil[0].lebar;
      if(tampil[0].divisi[i].pekerjaan[c].satuan == 'Liter'){
        volume = volume * 0.3;
      }
      tampil[0].divisi[i].pekerjaan[c].volume = volume;
    var done = false;
    connection.query("select * from detail_pekerjaan where id_pekerjaan='"+tampil[0].divisi[i].pekerjaan[c].id+"' and deleted = 0", function(err, rows, fields) {
      tampil[0].divisi[i].pekerjaan[c].detail = rows;
      done = true;
      
    })
    deasync.loopWhile(function(){return !done;});
 
    for(var a = 0; a< tampil[0].divisi[i].pekerjaan[c].detail.length; a++){
      tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan = volume * tampil[0].divisi[i].pekerjaan[c].detail[a].koefisien;
      tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan = tampil[0].divisi[i].pekerjaan[c].detail[a][tampil[0].daerah];
      if( tampil[0].divisi[i].pekerjaan[c].detail[a].satuan == 'Jam'){
        tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'HOK';
        if( tampil[0].divisi[i].pekerjaan[c].detail[a].jenis_uraian == 'peralatan'){
          tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'Sewa per hari';
        }

        tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan / 7);
       
      
        tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * 7;
      }else if( tampil[0].divisi[i].pekerjaan[c].detail[a].satuan == 'kg'){
        tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'Drum';
        tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan / 155);
        tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * 155;
      }else{
        tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = tampil[0].divisi[i].pekerjaan[c].detail[a].satuan;
        tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan);
        tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan;
        
      }
      tampil[0].divisi[i].pekerjaan[c].detail[a].harga_total =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi * tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi;
      total_pekerjaan = total_pekerjaan +  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_total;
      harga_satuan = harga_satuan +  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * tampil[0].divisi[i].pekerjaan[c].detail[a].koefisien;
    }
    tampil[0].divisi[i].pekerjaan[c].total_pekerjaan = total_pekerjaan;
    tampil[0].divisi[i].pekerjaan[c].harga_satuan = harga_satuan;

  }
  }

 //res.json(tampil);
  res.render('content-backoffice/notifikasi/cetak_rab_aspal', { data: tampil});
});
app.get('/cetak_rab_beton/:id_rab', function (req, res) {
  // console.log(req.body);
   var tampil = {};
 
   var done = false;
   connection.query("select * from input_rab where id="+req.params.id_rab, function(err, rows, fields) {
     tampil = rows;
     done = true;
     
   })
   deasync.loopWhile(function(){return !done;});
 
   // var done = false;
   // connection.query("select nama_proyek, id from master_proyek where id='1' and deleted = 0", function(err, rows, fields) {
   //   tampil = rows;
   //   done = true;
     
   // })
   // deasync.loopWhile(function(){return !done;});
 
   var done = false;
   connection.query("select nama_divisi, id from master_divisi where id_proyek='2' and deleted = 0", function(err, rows, fields) {
     tampil[0].divisi = rows;
     done = true;
     
   })
   deasync.loopWhile(function(){return !done;});
 
   //perulangan divisi
   for(var i = 0; i< tampil[0].divisi.length; i++){
 
     var done = false;
     connection.query("select * from master_pekerjaan where id_divisi='"+tampil[0].divisi[i].id+"' and deleted = 0", function(err, rows, fields) {
       tampil[0].divisi[i].pekerjaan = rows;
       done = true;
       
     })
     deasync.loopWhile(function(){return !done;});
    
     for(var c = 0; c< tampil[0].divisi[i].pekerjaan.length; c++){
       var total_pekerjaan = 0;
       var harga_satuan = 0;
       var volume = tampil[0].panjang * tampil[0].lebar * tampil[0].tinggi;
       if(tampil[0].divisi[i].pekerjaan[c].id == 3){
        volume =  tampil[0].panjang_lpa * tampil[0].lebar_lpa * tampil[0].tinggi_lpa;
      }
      //  if(tampil[0].divisi[i].pekerjaan[c].satuan == 'Liter'){
      //    volume = volume * 0.3;
      //  }
       tampil[0].divisi[i].pekerjaan[c].volume = volume;
     var done = false;
     connection.query("select * from detail_pekerjaan where id_pekerjaan='"+tampil[0].divisi[i].pekerjaan[c].id+"' and deleted = 0", function(err, rows, fields) {
       tampil[0].divisi[i].pekerjaan[c].detail = rows;
       done = true;
       
     })
     deasync.loopWhile(function(){return !done;});
  
     for(var a = 0; a< tampil[0].divisi[i].pekerjaan[c].detail.length; a++){
       tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan = volume * tampil[0].divisi[i].pekerjaan[c].detail[a].koefisien;
       tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan = tampil[0].divisi[i].pekerjaan[c].detail[a][tampil[0].daerah];
       if( tampil[0].divisi[i].pekerjaan[c].detail[a].satuan == 'Jam'){
         tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'HOK';
         if( tampil[0].divisi[i].pekerjaan[c].detail[a].jenis_uraian == 'peralatan'){
           tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'Sewa per hari';
         }
 
         tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan / 7);
        
       
         tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * 7;
       }
      //  else if( tampil[0].divisi[i].pekerjaan[c].detail[a].satuan == 'kg'){
      //    tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'Drum';
      //    tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan / 155);
      //    tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * 155;
      //  }
       else{
         tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = tampil[0].divisi[i].pekerjaan[c].detail[a].satuan;
         tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan);
         tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan;
         
       }
       tampil[0].divisi[i].pekerjaan[c].detail[a].harga_total =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi * tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi;
       total_pekerjaan = total_pekerjaan +  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_total;
       harga_satuan = harga_satuan +  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * tampil[0].divisi[i].pekerjaan[c].detail[a].koefisien;
     }
     tampil[0].divisi[i].pekerjaan[c].total_pekerjaan = total_pekerjaan;
     tampil[0].divisi[i].pekerjaan[c].harga_satuan = harga_satuan;
 
   }
   }
  
   res.render('content-backoffice/notifikasi/cetak_rab_beton', { data: tampil});
 });

app.get('/cetak_denah/:id_rab', function (req, res) {
      var tampil = {};

      var done = false;
      connection.query("select * from input_rab where id="+req.params.id_rab, function(err, rows, fields) {
        tampil = rows;
        done = true;
        
      })
      deasync.loopWhile(function(){return !done;});
// res.json({data:tampil})
  res.render('content-backoffice/notifikasi/cetak_denah', {data: tampil});
});

app.get('/cetak_denah_beton/:id_rab', function (req, res) {
  var tampil = {};

  var done = false;
  connection.query("select * from input_rab where id="+req.params.id_rab, function(err, rows, fields) {
    tampil = rows;
    done = true;
    
  })
  deasync.loopWhile(function(){return !done;});
// res.json({data:tampil})
res.render('content-backoffice/notifikasi/cetak_beton', {data: tampil});
});

app.post('/hitung_aspal', function (req, res) {
  var post = req.body;
  var idne = 0;
  sql_enak.insert(post).into("input_rab").then(function (id) {
     idne = id;

  })
  .finally(function() {
     res.json({id : idne});
  });

})

app.post('/kritik_saran', function (req, res) {
  var post = req.body;
  var idne = 0;
  sql_enak.insert(post).into("kritik_saran").then(function (id) {
     idne = id;

  })
  .finally(function() {
     res.json({id : idne});
  });

})

app.get('/rab_json/:id_rab', function (req, res) {
 // console.log(req.body);
  var tampil = {};

  var done = false;
  connection.query("select * from input_rab where id="+req.params.id_rab, function(err, rows, fields) {
    tampil = rows;
    done = true;
    
  })
  deasync.loopWhile(function(){return !done;});

  // var done = false;
  // connection.query("select nama_proyek, id from master_proyek where id='1' and deleted = 0", function(err, rows, fields) {
  //   tampil = rows;
  //   done = true;
    
  // })
  // deasync.loopWhile(function(){return !done;});

  var done = false;
  connection.query("select nama_divisi, id from master_divisi where id_proyek='1' and deleted = 0", function(err, rows, fields) {
    tampil[0].divisi = rows;
    done = true;
    
  })
  deasync.loopWhile(function(){return !done;});

  //perulangan divisi
  for(var i = 0; i< tampil[0].divisi.length; i++){

    var done = false;
    connection.query("select * from master_pekerjaan where id_divisi='"+tampil[0].divisi[i].id+"' and deleted = 0", function(err, rows, fields) {
      tampil[0].divisi[i].pekerjaan = rows;
      done = true;
      
    })
    deasync.loopWhile(function(){return !done;});
   
    for(var c = 0; c< tampil[0].divisi[i].pekerjaan.length; c++){
      var total_pekerjaan = 0;
      var harga_satuan = 0;
      var volume = tampil[0].panjang * tampil[0].lebar;
      if(tampil[0].divisi[i].pekerjaan[c].satuan == 'Liter'){
        volume = volume * 0.3;
      }
      tampil[0].divisi[i].pekerjaan[c].volume = volume;
    var done = false;
    connection.query("select * from detail_pekerjaan where id_pekerjaan='"+tampil[0].divisi[i].pekerjaan[c].id+"' and deleted = 0", function(err, rows, fields) {
      tampil[0].divisi[i].pekerjaan[c].detail = rows;
      done = true;
      
    })
    deasync.loopWhile(function(){return !done;});
 
    for(var a = 0; a< tampil[0].divisi[i].pekerjaan[c].detail.length; a++){
      tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan = volume * tampil[0].divisi[i].pekerjaan[c].detail[a].koefisien;
      tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan = tampil[0].divisi[i].pekerjaan[c].detail[a][tampil[0].daerah];
      if( tampil[0].divisi[i].pekerjaan[c].detail[a].satuan == 'Jam'){
        tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'HOK';
        if( tampil[0].divisi[i].pekerjaan[c].detail[a].jenis_uraian == 'peralatan'){
          tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'Sewa per hari';
        }

        tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan / 7);
       
      
        tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * 7;
      }else if( tampil[0].divisi[i].pekerjaan[c].detail[a].satuan == 'kg'){
        tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'Drum';
        tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan / 155);
        tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * 155;
      }else{
        tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = tampil[0].divisi[i].pekerjaan[c].detail[a].satuan;
        tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan);
        tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan;
        
      }
      tampil[0].divisi[i].pekerjaan[c].detail[a].harga_total =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi * tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi;
      total_pekerjaan = total_pekerjaan +  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_total;
      harga_satuan = harga_satuan +  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * tampil[0].divisi[i].pekerjaan[c].detail[a].koefisien;
    }
    tampil[0].divisi[i].pekerjaan[c].total_pekerjaan = total_pekerjaan;
    tampil[0].divisi[i].pekerjaan[c].harga_satuan = harga_satuan;

  }
  }
 
  res.json(tampil);
});


app.get('/rab_beton_json/:id_rab', function (req, res) {
  // console.log(req.body);
   var tampil = {};
 
   var done = false;
   connection.query("select * from input_rab where id="+req.params.id_rab, function(err, rows, fields) {
     tampil = rows;
     done = true;
     
   })
   deasync.loopWhile(function(){return !done;});
 
   // var done = false;
   // connection.query("select nama_proyek, id from master_proyek where id='1' and deleted = 0", function(err, rows, fields) {
   //   tampil = rows;
   //   done = true;
     
   // })
   // deasync.loopWhile(function(){return !done;});
 
   var done = false;
   connection.query("select nama_divisi, id from master_divisi where id_proyek='2' and deleted = 0", function(err, rows, fields) {
     tampil[0].divisi = rows;
     done = true;
     
   })
   deasync.loopWhile(function(){return !done;});
 
   //perulangan divisi
   for(var i = 0; i< tampil[0].divisi.length; i++){
 
     var done = false;
     connection.query("select * from master_pekerjaan where id_divisi='"+tampil[0].divisi[i].id+"' and deleted = 0", function(err, rows, fields) {
       tampil[0].divisi[i].pekerjaan = rows;
       done = true;
       
     })
     deasync.loopWhile(function(){return !done;});
    
     for(var c = 0; c< tampil[0].divisi[i].pekerjaan.length; c++){
       var total_pekerjaan = 0;
       var harga_satuan = 0;
       var volume = tampil[0].panjang * tampil[0].lebar * tampil[0].tinggi;
       if(tampil[0].divisi[i].pekerjaan[c].satuan == 'Liter'){
         volume = volume * 0.3;
       }
       tampil[0].divisi[i].pekerjaan[c].volume = volume;
     var done = false;
     connection.query("select * from detail_pekerjaan where id_pekerjaan='"+tampil[0].divisi[i].pekerjaan[c].id+"' and deleted = 0", function(err, rows, fields) {
       tampil[0].divisi[i].pekerjaan[c].detail = rows;
       done = true;
       
     })
     deasync.loopWhile(function(){return !done;});
  
     for(var a = 0; a< tampil[0].divisi[i].pekerjaan[c].detail.length; a++){
       tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan = volume * tampil[0].divisi[i].pekerjaan[c].detail[a].koefisien;
       tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan = tampil[0].divisi[i].pekerjaan[c].detail[a][tampil[0].daerah];
       if( tampil[0].divisi[i].pekerjaan[c].detail[a].satuan == 'Jam'){
         tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'HOK';
         if( tampil[0].divisi[i].pekerjaan[c].detail[a].jenis_uraian == 'peralatan'){
           tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'Sewa per hari';
         }
 
         tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan / 7);
        
       
         tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * 7;
       }
      //  else if( tampil[0].divisi[i].pekerjaan[c].detail[a].satuan == 'kg'){
      //    tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = 'Drum';
      //    tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan / 155);
      //    tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * 155;
      //  }
       else{
         tampil[0].divisi[i].pekerjaan[c].detail[a].konversi = tampil[0].divisi[i].pekerjaan[c].detail[a].satuan;
         tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi =  Math.ceil(tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan);
         tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan;
         
       }
       tampil[0].divisi[i].pekerjaan[c].detail[a].harga_total =  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan_konversi * tampil[0].divisi[i].pekerjaan[c].detail[a].kebutuhan_konversi;
       total_pekerjaan = total_pekerjaan +  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_total;
       harga_satuan = harga_satuan +  tampil[0].divisi[i].pekerjaan[c].detail[a].harga_satuan * tampil[0].divisi[i].pekerjaan[c].detail[a].koefisien;
     }
     tampil[0].divisi[i].pekerjaan[c].total_pekerjaan = total_pekerjaan;
     tampil[0].divisi[i].pekerjaan[c].harga_satuan = harga_satuan;
 
   }
   }
  
   res.json(tampil);
 });

// app.get('/4E26CD6CB47148CCFB9334CB15B95495.txt', function (req, res) {
//   console.log(req.user)
//   //res.render('7ECA9DC7A2167A6EB33B60F1DA8B85E1.txt');
//   var file = __dirname + '/4E26CD6CB47148CCFB9334CB15B95495.txt';
//     res.download(file);
// });
// app.listen(800, function () {
//   console.log('Example app listening on port 800!');
//admin
//mysql

app.use(function (req, res, next) {
  res.status(404).send("Halaman yang anda tuju tidak ada!")
})
  
// <!-- start socketio connection -->

// io.sockets.on('connection', function (socket) {	



// });

