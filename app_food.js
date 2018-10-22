var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var static = require('serve-static');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));

var database;
var CafeteriaSchema;
var CafeteriaModel;
//메뉴 추가
app.post("/process/addMenu", function(req, res){
  console.log('/process/addMenu 호출되었음.');

  var paramDate = req.body.date;
  var paramPart = req.body.part;
  var paramMenu = req.body.menu;

  addMenu(paramDate, paramPart, paramMenu);
  console.log('Add Menu Success!');
});
function addMenu(paramDate, paramPart, paramMenu){
  var cafeteria = new CafeteriaModel({
      'date':paramDate,
      'part':paramPart,
      'menu':paramMenu
      }
    );

  cafeteria.save(function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    console.log(paramDate+ ', '+paramPart+ ', '+ paramMenu+ 'document 추가되었습니다.');
  });
}
//메뉴 읽기
app.get("/process/listMenu", function(req, res){
  console.log('/process/listMenu 호출되었음.');
	listMenu(req, res);
	console.log('List Menu Success');
});
function listMenu(req, res) {
  CafeteriaModel.find({}, function(err, cafeterias){
    console.log('cafeterias.length: '+cafeterias.length);
    if (err) {
      callback(err, null);
      return;
    } else {
    	res.writeHead(200, {"Content-Type":"text/html"});
    	res.end(JSON.stringify(cafeterias));
    }
  });
}
//메뉴 삭제
app.post("/process/delMenu", function(req, res){
  var paramDate = req.body.date;
  var paramPart = req.body.part;

  CafeteriaModel.remove({
    'date': paramDate,
    'part': paramPart
    }, function(err, cafeterias){
    console.log(cafeterias[0]+'삭제');
  });
});

//파일로 만들기

function connectDB() {
  // 데이터베이스 연결 정보
  var databaseUrl = 'mongodb://localhost:27017/local';

  // 데이터베이스 연결
  console.log('데이터베이스 연결을 시도합니다.');
  mongoose.Promise = global.Promise;
  mongoose.connect(databaseUrl);
  database = mongoose.connection;

  database.on('error', console.error.bind(console, 'mongoose connection error.'));
  database.on('open', function () {
    console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);

    createCafeteriaSchema();
  });

  database.on('disconnected', function() {
    console.log('연결이 끊어졌습니다. 5초 후 재연결합니다.');
    setInterval(connectDB, 5000);
  });
}

function createCafeteriaSchema() {

  CafeteriaSchema = new Schema({
    date: {type: Number},
    part: {type: String, default: 0},
    menu: {type: String, default: 0},
  });
  console.log('CafeteriaSchema 정의되었음');

  CafeteriaModel = mongoose.model('Cafeteria', CafeteriaSchema);
  console.log('CafeteriaModel 정의되었음');
}

http.createServer(app).listen(9999, function(){
  console.log('서버가 시작되었습니다. 포트 : ' + '9999');
  connectDB();
});