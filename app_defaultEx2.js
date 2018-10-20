var express = require('express');//조금 더 알아봐야할 것 같다
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var static = require('serve-static');
var expressSession = require('express-session');

var config = require('./config');
var database = require('./database/database');
var route_loader = require('./routes/route_loader');

var app = express();

//3000대신 config.server_port를 가져오는 것이 더 효율적(config에 port값을 지정해준 의미가 없음)
app.set('port', process.env.PORT || config.server_port);
app.use(bodyParser.urlencoded({ extended: false }))// false: 문자열이나 배열을 포함
app.use(bodyParser.json())
app.use('/public', static(path.join(__dirname, 'public')));
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));
// 이렇게 보내면 라우터로 모듈화된 파일 내에 require('express'), express.Router();가 없어도 OK
route_loader.init(app, express.Router());

process.on('uncaughtException', function (err) {
	console.log('uncaughtException 발생함 : ' + err);
	console.log('서버 프로세스 종료하지 않고 유지');	
	console.log(err.stack);
});

// app.on('close', function () {
// 	console.log("Express 서버 객체가 종료됩니다.");
// 	if (database.db) {
// 		database.db.close();
// 	}
// });
// app.on이란 없는 듯 하며, 'close'라는 속성도 없는 듯 하다.
// process.on('SIGINT', function()) 으로 바꿔주니 프로세스 인터럽트가 발생할 때 실행 OK
// but, 위의 uncaughtException 때문에 강제 종료는 되지 않음
var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
	// 데이터베이스 초기화
	database.init(app, config);
});