var http=require("http");
var express=require("express");
var mysql=require("mysql");
var bodyParser=require("body-parser");
var static = require('serve-static');
var path = require('path');
var app=express();
var server=http.createServer(app);
var jsonfile = require('jsonfile');

app.use('/public', static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());//JSON형식으로 파라미터를 변환

var pool=mysql.createPool({
	host:"localhost",//host:"0.0.0.0"
	user:"root",//user:"root"
	password:"111111",//password:"ari610"
	database:"o2"//database:"o2"
});

app.get('/reservation', function(req, res){
  res.sendFile(__dirname + '/public/reservation.html');
});
app.post("/resAjax", function(req, res){
	console.log("클라이언트의 post전송을 받았습니다!!");
	console.log(req.body);
	var rDate=req.body.rDate;//날짜(일자, 요일 분리 필요)
	var rClass=req.body.rClass;//강의실
	var rNum=req.body.rNum;//호수
	var array=req.body.array;//배열
	var key = rDate+rClass+rNum+array;

  pool.getConnection(function(error, con){

    if(error){
      console.log(error);
		}else{
			console.log("접속 성공");

			var sql="select rkey from reservation where rkey = ?";
			con.query(sql, key, function(err, result){
				var reBool = true;
				console.log(key);
				if(result == ""){
					console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",key);
					reBool = false;
				}
				if(reBool){
					console.log(reBool);
					console.log(result, "등록 실패");
          res.end(JSON.stringify(reBool));
				}else{
					console.log(reBool);
					console.log(result, "등록 가능");
					res.writeHead(200, {"Content-Type":"text/html"});
					res.end(JSON.stringify(reBool));
				}
        con.release();
			});
		}
	});
});
//빈 강의실 예약 요청
app.post("/reservation/sub", function(req, res){
	console.log("클라이언트의 post전송을 받았습니다!!");
	console.log(req.body);
	var key=req.body.key;//날짜(일자, 요일 분리 필요)
	var stId=req.body.stId;//날짜(일자, 요일 분리 필요)

  pool.getConnection(function(error, con){
    if(error){
      console.log(error);
		}else{
			console.log("접속 성공");

			var sql="insert into reservation(rkey,stId) values(?,?)";
			con.query(sql,[key,stId], function(err, result){
				console.log(result);
				console.log(result,key,stId);
				if(err){
					console.log(err, "등록 실패");
					res.end("Fail");
				}else{
					res.writeHead(200, {"Content-Type":"text/html"});
					res.end("OK");
				}
        con.release();
			});
		}
	});
});
app.post("/reservation/delete", function(req, res){
	console.log("클라이언트의 post전송을 받았습니다!!");
	console.log(req.body);
	var key=req.body.key;//날짜(일자, 요일 분리 필요)
	var stId=req.body.stId;//날짜(일자, 요일 분리 필요)

  pool.getConnection(function(error, con){
    if(error){
      console.log(error);
		}else{
			console.log("접속 성공");
      //아래 데이터베이스 이름에 맞춰서 변경해주기
			var sql="delete from reservation where rkey = ? and stId = ?";
			con.query(sql,[key,stId], function(err, result){
			console.log("#############################################3");
				console.log(err);
				if(!result.affectedRows){
					console.log(err, "삭제 실패");
					res.end("Fail");
				}else{
					res.writeHead(200, {"Content-Type":"text/html"});
					res.end("OK");
				}
        con.release();
			});
		}
	});
});
//빈 강의실 조회 요청
app.post("/reservation/list", function(req, res){
	console.log(rDate+' '+rClass+' '+rNum+' '+rDay);
  var rDate=req.body.rDate;//날짜(일자, 요일 분리 필요)
  var rClass=req.body.rClass;//강의실
  var rNum=req.body.rNum;//호수
  var rDay=req.body.rDay;//요일
  console.log(rDate+ " " + rClass);
  var resultData = {};

  pool.getConnection(function(error, con){
    if(error){
      console.log(error);
    }else{
      var sql="select number, substring_index(substring_index(timeTable, '"+rDay+"(', -1), ')', 1) as timeTable from (select number, timeTable from (select number,timeTable from (select number, timeTable from lecture2 where timeTable like '%"+rClass+"%') as leca where leca.timeTable like '%"+rNum+"%') as lecb where lecb.timeTable like '%"+rDay+"%') as lecc";
      con.query(sql, function(err, result){
        if(err){
          console.log(err);
        }else{
          // 예약된 상황이 JSON파일로 필요하다면 아래 주석 풀어서 맞게 적용
					// const file = './uploads/LecList.json'
					// const list = result;
					// jsonfile.writeFile(file, {list}, function(err){
					// 	if(err) console.log(err);
					// });
					console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
          console.log(result);
					if(err){
						console.log(err);
					} else {
          	res.end(JSON.stringify(result));
        	}
				}
        con.release();
			});
		}
	});
});

server.listen(3003, function(){
	console.log("웹 서버가 3003포트에서 실행중...");
});
