var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var static = require('serve-static');
var expressSession = require('express-session');

var config = require('./config');
var database = require('./databse/databse');
var route_loader = require('./routes/route_loader');
var app = express();

console.log('config.server_port: %d', config.server_port);
app.set('port', process.env.PORT || 3000);//process.env.PORT가 뭐냐고
app.use(bodyParser.urlencoded({ extended:false }))
app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

route_loader.init(app, express.Router());

process.on('uncaughtException', function(err){
	console.log('uncaughtException 발생함: '+ err);
	console.log('서버 프로세스 종료하지 않고 유지');
	console.log(err.stack);
});

process.on('SIGTERM', function(){
	console.log('Terminating Process');
	app.close();
});

app.on('close', function(){
	console.log('Express 서버 객체가 종료됩니다');
	if(database.db){
		database.db.close();
	}
});

var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('Start Server, Port '+ app.get('port'));
	database.init(app, config);
});