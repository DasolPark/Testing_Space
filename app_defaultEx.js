var express = require('express')
  , http = require('http')
  , path = require('path');
var bodyParser = require('body-parser')
//var cookieParser = require('cookie-parser')//쿠키는 이제 필요 없어 보임
  , static = require('serve-static');
var expressSession = require('express-session');

var config = require('./config');
var database = require('./database/database');
var route_loader = require('./routes/route_loader');

var app = express();
var router = express.Router();

console.log('config.server_port : %d', config.server_port);
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: false }))//문자열이나 배열을 포함하고자 할 때는 false, 임의의 유형은 true
app.use(bodyParser.json())
app.use('/public', static(path.join(__dirname, 'public')));
// app.use(cookieParser()); //필요 없어 보임
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

route_loader.init(app, router);

/** 서버 시작 **/
process.on('uncaughtException', function (err) {
	console.log('uncaughtException 발생함 : ' + err);
	console.log('서버 프로세스 종료하지 않고 유지함.');
	console.log(err.stack);
});

process.on('close', function () {//app.on이 아니고 process.on인듯
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.db.close();
	}
});//작동 안 됨(서버에서 실험해보자 process인지, app인지)

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

	// 데이터베이스 초기화
	database.init(app, config);
});//http.createServer(app).listen(app.get('port'), function()
//이렇게 해줌으로써의 장점은?