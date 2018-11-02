/*웹 서버 구축하기*/
var http=require("http");//괄호 안은 '모듈'이라고 부름
var express=require("express");//기본 서버 모듈의 보강
var mysql=require("mysql");//mysql데이터베이스 핸들링 해주는 모듈
var bodyParser=require("body-parser");
var static = require('serve-static');
var path = require('path');
var app=express();
var server=http.createServer(app);//express를 잡아먹어야 업그레이드가 됨

app.use('/public', static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());//JSON형식으로 파라미터를 변환

var pool=mysql.createPool({//튜뷰들이 엄청나게 들어있다고 생각
	host:"localhost",
	user:"root",
	password:"",
	database:"front2"
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/lecture.html');
});
//회원 등록 요청 처리
app.post("/member/regist", function(request, response){
	console.log("클라이언트의 post전송을 받았습니다!!");
	console.log(request.body);
	var id=request.body.id;
	var pw=request.body.pw;
	var name=request.body.name;

  pool.getConnection(function(error, con){
    if(error){
      console.log(error);//대여 불가능이기때문에 더 이상 작업불가
    }else{
      var sql="insert into member2(id,pw,name) values(?,?,?)";
      con.query(sql, [id, pw, name], function(err, result, fields){
        if(err){
					console.log(err, "등록 실패");
				}else{
					response.writeHead(200, {"Content-Type":"text/html"});
					response.end("OK");
				}
        con.release();//다시 풀로 돌려보냄..(튜브에 바람빼지말고 돌려보냄)
      });//쿼리문 수행!!
    }
  });
});
//리스트 요청 처리
app.get("/member/list", function(request, response){

  pool.getConnection(function(error, con){
    if(error){
      console.log(error);
    }else{
      var sql="select * from member2 order by member2_id asc";//오름차순으로 보여줄거야

      con.query(sql, function(err, result){
        if(err){
          console.log(err);//심각한 에러, 해줄 수 있는 게 없다.
        }else{//오류가 안 난 경우...오류가 없다고 하여 수정이 완료되었다고 단정하면 안 된다.
          response.writeHead(200, {"Content-Type":"text/html"});
          response.end(JSON.stringify(result));
        }
        con.release();
      });
    }
  });
});

app.use("/member/detail", function(request, response){
	console.log(request.query);//{member2_id:'5'}
	var member2_id=request.query.member2_id;

	pool.getConnection(function(error, con){
		if(error){
			console.log(error);//대여 불가능이기때문에 더 이상 작업불가
		}else{
			var sql="select * from member2 where member2_id=?";
			con.query(sql, [member2_id], function(err, result, fields){
				if(err){
					console.log(err);
				}else{
					console.log(result);//json이 반환될 것 같음
					//요청한 클라이언트에게 정보를 보내자!!
					response.writeHead(200, {"Content-Type":"text/html"});
					response.end(JSON.stringify(result));
				}
				con.release();//다시 풀로 돌려보냄..(튜브에 바람빼지말고 돌려보냄)
			});//쿼리문 수행!!
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
					if(result.affectedRows==1){//쿼리문에 의해 영향받은 레코드가 있다.
						response.end("ok");//성공
					}else{
						response.end("fail");//에러는 나지 않았으나, 반영된 레코드가 없다. 지워진 것 없다.
					}
				}
				con.release();
			});
		}
	});//이미 접속된 객체 대여!! 새로운 접속 아님!!
});

//수정 요청 처리
app.post("/member/edit", function(request, response){
	var member2_id=request.body.member2_id;
	var id=request.body.id;//{}
	var pw=request.body.pw;
	var name=request.body.name;

	console.log(id, pw, name, member2_id);

	pool.getConnection(function(error, con){
		if(error){
			console.log(error);
		}else{
			var sql="update member2 set id=?,pw=?,name=? where member2_id=?";

			con.query(sql, [id, pw, name, member2_id], function(err, result){
				if(err){
					console.log(err);//심각한 에러, 해줄 수 있는 게 없다.
				}else{//오류가 안 난 경우...오류가 없다고 하여 수정이 완료되었다고 단정하면 안 된다.
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

server.listen(9999, function(){
	console.log("웹 서버가 9999포트에서 실행중...");
});
