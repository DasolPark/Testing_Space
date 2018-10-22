var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var static = require('serve-static');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));

var database;
var CafeteriaSchema;
var CafeteriaModel;

app.post("/process/addMenu", function(req, res){
  console.log('/process/addMenu 호출됨.');

  var paramDate = req.body.date;
  var paramPart = req.body.part;
  var paramMenu = req.body.menu;

  addMenu(database, paramDate, paramPart, paramMenu);
  console.log('add Menu Success!');
});
function addMenu(database, paramDate, paramPart, paramMenu){//database 빼기
  var cafeteria = new CafeteriaModel({
    "date":paramDate,
    "part":paramPart,
    "menu":paramMenu}
    );

  cafeteria.save(function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    console.log(paramDate+ ', '+paramPart+ ', '+ paramMenu+ 'document 추가되었습니다.');
  });
}

app.get("/process/listMenu", function(req, res){
	req.app.get(database);
	listMenu(database);
	console.log('getList Success');
});
function listMenu(database) {//paramdate, parampart 를 이용해 삭제
  console.log('listMenu 호출됨.');
  console.log(database);
  //메뉴 번호를 입력하면 해당 메뉴의 도큐먼트만 삭제되도록 할 것  
  database.cafeteria.find({});
  cafeteria.save(function(err, result) {
    if (err) {
      callback(err, null);
      return;
    } else {
    	console.log(result);
    	response.writeHead(200, {"Content-Type":"text/html"});
    	response.end(JSON.stringify(result));
    }
  });
}
/*
app.use("/member/detail", function(request, response){
	console.log(request.query);
	var member2_id=request.query.member2_id;

	pool.getConnection(function(error, con){
		if(error){
			console.log(error);
		}else{
			var sql="select * from member2 where member2_id=?";
			con.query(sql, [member2_id], function(err, result, fields){
				if(err){
					console.log(err);
				}else{
					console.log(result);
					response.writeHead(200, {"Content-Type":"text/html"});
					response.end(JSON.stringify(result));
				}
				con.release();
			})
		}
	});
});

app.get("/member/del", function(request, response){
	var member2_id=request.query.member2_id;

	pool.getConnection(function(error, con){
		if(error){
			console.log(error);
		}else{
			var sql="delete from member2 where member2_id=?";
			con.query(sql, [member2_id], function(err, result, fields){
				if(err){
					console.log(err, "삭제 실패ㅜㅜ");
					response.writeHead(500, {"Content-Type":"text/html"});
					response.end("fail");
				}else{
					console.log("삭제 결과", result);
					response.writeHead(200, {"Content-Type":"text/html"});
					if(result.affectedRows==1){
						response.end("ok");
					}else{
						response.end("fail");
					}
				}
				con.release();
			});
		}
	});
});

app.post("/member/edit", function(request, response){
	var member2_id=request.body.member2_id;
	var id=request.body.id;
	var pw=request.body.pw;
	var name=request.body.name;

	console.log(id, pw, name, member2_id);

	pool.getConnection(function(error, con){
		if(error){
			console.log(error);
		}else{
			var sql="update member2 set id=?, pw=?, name=?, where member2_id=?";
			con.query(sql, [id, pw, name, member2_id], function(err, result){
				if(err){
					console.log(err);
				}else{
					response.writeHead(200, {"Content-Type":"text/html"});
					if(result.affectedRows==1){
						response.end("ok");
					}else{
						response.end("fail");
					}
				}
				con.release();
			});
		}
	});
});
*/
function connectDB() {
  // 데이터베이스 연결 정보
  var databaseUrl = 'mongodb://localhost:27017/local';

  // 데이터베이스 연결
  console.log('데이터베이스 연결을 시도합니다.');
  mongoose.Promise = global.Promise;  // mongoose의 Promise 객체는 global의 Promise 객체 사용하도록 함
  mongoose.connect(databaseUrl);
  database = mongoose.connection;

  database.on('error', console.error.bind(console, 'mongoose connection error.'));
  database.on('open', function () {
    console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);

    // user 스키마 및 모델 객체 생성
    createCafeteriaSchema();
  });

  // 연결 끊어졌을 때 5초 후 재연결
  database.on('disconnected', function() {
    console.log('연결이 끊어졌습니다. 5초 후 재연결합니다.');
    setInterval(connectDB, 5000);
  });
}

function createCafeteriaSchema() {
  // 스키마 정의
  CafeteriaSchema = mongoose.Schema({
    date: {type: Number},
    part: {type: String, default: 0},
    menu: {type: String, default: 0},
  });
  console.log('CafeteriaSchema 정의함.');

  // CafeteriaModel 모델 정의
  CafeteriaModel = mongoose.model("Cafeteria", CafeteriaSchema);
  app.set('database', database);
  console.log('Cafeteria 정의함.');
}

http.createServer(app).listen(9999, function(){
  console.log('서버가 시작되었습니다. 포트 : ' + '9999');
  // 데이터베이스 연결을 위한 함수 호출
  connectDB();
});