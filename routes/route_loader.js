var route_loader = {};
var config = require('../config');

route_loader.init = function(app, router){//이 것의 사용법이 궁금하다(.init은 함수명? 하나의 객체?)
	console.log('called route_loader.init');//함수명이 되는 듯
	return initRoutes(app, router);
}

function initRoutes(app, router){
	var infoLen = config.route_info.length;

	console.log('설정에 정의된 라우팅 모듈의 수: %d', infoLen);

	for(var i=0; i<infoLen; i++){
		var curItem = config.route_info[i];//각 객체 하나씩 가리킴 {file:'./user', path:'/process/login', method:'login', type:'post'}
		var curModule = require(curItem.file);//./user(login or adduser or listuser)
		console.log('%s 파일에서 모듈정보를 읽어옴', curItem.file);//./user

		if(curItem.type == 'get'){//module.exports를 여러 개 하면 배열화 된다
			router.route(curItem.path).get(curModule[curItem.method]);// router.route(/process/login).get(./user[login] 곧, login(req, res)); 
		} else if(curItem.type == 'post') {
			router.route(curItem.path).post(curModule[curItem.method]);//즉 curModule[curItem.method]는 curModule[login]임
		} else {
			router.route(curItem.path).post(curModule[curItem.method]);//즉 curModule = {login: [Function], adduser: [Function], listuser: [Function]}
		}
		console.log('Set routing module [%s]', curItem.method);
	}
	app.use('/', router);
}

module.exports = route_loader;