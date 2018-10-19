var route_loader = {};
var config = require('../config');

route_loader.init = function(app, router){
	console.log('Called route_loader');
	return initRoutes(app, router);
}

function initRoutes(app, router){
	var infoLen = config.route_info.length;
	console.log('config route_info length: %d', infoLen);

	for(var i=0; i<infoLen; i++){
		var curItem = config.route_info[i];

		var curModule = require('curItem.file');
		console.log('Read Module %s file', curItem.file);

		if(curItem.type == 'get'){
			router.route(curItem.path).get(curModule[curItem.method]);//exports가 여러개면 배열화가 되나?
		} else if (curItem.type == 'post'){
			router.route(curItem.path).post(curModule[curItem.method]);
		} else {
			router.route(curItem.path).post(curModule[curItem.method]);
		}
		console.log('Set Routing Module [%s]', curItem.method);
	}
	app.use('/', router);
}

module.exports = route_loader;