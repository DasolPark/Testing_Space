/*웹 서버 구축하기*/
var http=require("http");//괄호 안은 '모듈'이라고 부름
var express=require("express");//기본 서버 모듈의 보강
var mysql=require("mysql");//mysql데이터베이스 핸들링 해주는 모듈
var bodyParser=require("body-parser");
var static = require('serve-static');
var path = require('path');
var app=express();
var server=http.createServer(app);//express를 잡아먹어야 업그레이드가 됨
var jsonfile = require('jsonfile');

app.use('/public', static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());//JSON형식으로 파라미터를 변환

var pool=mysql.createPool({//튜뷰들이 엄청나게 들어있다고 생각
	host:"localhost",//0.0.0.0
	user:"root",//root
	password:"111111",//ari610
	database:"o2"//o2
});

app.get('/room', function(req, res){
  res.sendFile(__dirname + '/public/adminRoom.html');
});

//Room 예약 리스트 요청
app.get("/room/list", function(req, res){
  pool.getConnection(function(error, con){
    if(error){
      console.log(error);
    }else{
      var sql="select * from reservation";

      con.query(sql, function(err, result){
        if(err){
          console.log(err);
        }else{
					const file = './uploads/RoomRes.json'
					const list = result;

					jsonfile.writeFile(file, {list}, function(err){
						if(err) console.log(err);
					});
					if(err){
						console.log(err);
					} else {
          res.writeHead(200, {"Content-Type":"text/html"});
          res.end(JSON.stringify(result));
        	}
				}
        con.release();
			});
		}
	});
});
//Room 예약 삭제 요청
app.get("/room/del", function(req, res){
	var stid = req.body.stid;
  pool.getConnection(function(error, con){
    if(error){
      console.log(error);
    }else{
      var sql="delete from reservation where stId=?";
      con.query(sql, stid, function(err, result){
        if(err){
          console.log(err);
        }else{
          res.writeHead(200, {"Content-Type":"text/html"});
          res.end(JSON.stringify(result));
				}
        con.release();
			});
		}
	});
});

server.listen(9999, function(){
	console.log("웹 서버가 9999포트에서 실행중...");
});
