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

app.get('/lecture', function(req, res){
  res.sendFile(__dirname + '/public/lecture.html');
});

//리스트 요청 처리
app.get("/lecutre/list", function(req, res){
  pool.getConnection(function(error, con){
    if(error){
      console.log(error);
    }else{
      var sql="select * from lecture2 order by number asc";//오름차순으로 보여줄거야

      con.query(sql, function(err, result){
        if(err){
          console.log(err);//심각한 에러, 해줄 수 있는 게 없다.
        }else{//오류가 안 난 경우...오류가 없다고 하여 수정이 완료되었다고 단정하면 안 된다.
					const file = './uploads/LecList.json'
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

server.listen(9999, function(){
	console.log("웹 서버가 9999포트에서 실행중...");
});
