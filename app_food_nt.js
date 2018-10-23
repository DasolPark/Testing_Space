var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var static = require('serve-static');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var app = express();
var fs = require('fs');//메뉴를 JSON파일로 바꿔주기 위한 모듈 불러옴

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));

var database;
var CafeteriaSchema;
var CafeteriaModel;
var number = 0;
//메뉴 추가 라우터
app.post("/process/addMenu", function(req, res){
  console.log('/process/addMenu 호출되었음.');

  var paramDate = req.body.date;
  var paramPart = req.body.part;
  var paramMenu = req.body.menu;

  addMenu(paramDate, paramPart, paramMenu);
  console.log('Add Menu Success!');
});
////메뉴 추가 함수
function addMenu(paramDate, paramPart, paramMenu){

    var cafeteria;
    if(number == 0){
      cafeteria = new CafeteriaModel({
          'number': number++,
          'date':paramDate,
          'part':paramPart,
          'menu':paramMenu
      });
    } else {
      cafeteria = new CafeteriaModel({
          'number': number++,
          'date':paramDate,
          'part':paramPart,
          'menu':paramMenu
      });     
    }

    cafeteria.save(function(err) {
      if (err) {
        console.log(err);
      }
      console.log(paramDate+ ', '+paramPart+ ', '+ paramMenu+ 'document 추가되었습니다.');
    });
}
////메뉴 읽기
app.get("/process/listMenu", function(req, res){
  console.log('/process/listMenu 호출되었음.');
	listMenu(req, res);
	console.log('List Menu Success');
});
//메뉴 읽기 함수
function listMenu(req, res) {
  CafeteriaModel.find({}, function(err, cafeterias){
    console.log('cafeterias.length: '+cafeterias.length);
    //리스트를 불러올 때마다 메뉴 리스트 저장(get list & save list)
    fs.writeFile('./uploads/menuList', cafeterias, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("cafeterias file was saved!");
    });
    if (err) {
      callback(err, null);
      return;
    } else {
    	res.writeHead(200, {"Content-Type":"text/html"});
    	res.end(JSON.stringify(cafeterias));
    }
  });
}
////메뉴 삭제
app.post("/process/delMenu", function(req, res){
  var paramNum = req.body.number;

  CafeteriaModel.findOneAndDelete({
    'number': paramNum
    }, function(err, cafeterias){
      if(err) { 
        console.log(err); 
      } else {
        console.log(paramNum+'번 document가 삭제되었습니다.');
      }
  });
});
//메뉴 전체 삭제
app.post("/process/delAllMenu", function(req, res){
  CafeteriaModel.deleteMany({}, function(err, cafeterias){
      if(err) { 
        console.err(err); 
      } else {
        console.log('document가 전체 삭제되었습니다.');
      }
  });
});

function connectDB() {
  var databaseUrl = 'mongodb://localhost:27017/local';

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
    number: {type: Number},
    date: {type: Number},
    part: {type: String, default: ''},
    menu: {type: String, default: ''}
  });
  console.log('CafeteriaSchema 정의되었음');

  CafeteriaModel = mongoose.model('Cafeteria', CafeteriaSchema);
  console.log('CafeteriaModel 정의되었음');
}

http.createServer(app).listen(9999, function(){
  console.log('서버가 시작되었습니다. 포트 : ' + '9999');
  connectDB();
});