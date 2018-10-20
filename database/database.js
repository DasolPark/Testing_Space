var mongoose = require('mongoose');
var database = {};

database.init = function(app, config){
	console.log('Called init()');
	//console.log(database);//궁금해서 호출해봤더니 { init: [Function] } 이 나옴. 즉, 객체의 일부로 함수가 저장됨
	connect(app, config);
}

function connect(app, config){
	console.log('Called connect()');

	mongoose.Promise = global.Promise;
	// database.db = mongoose.connect(config.db_url);
	// 위처럼은 안 되나 실행해보니, 실행 불가!
	mongoose.connect(config.db_url);//mongoose 객체 반환
	database.db = mongoose.connection;//NativeConnection 객체 반환
	// console.log(database.db);//찍어봤더니 역시나 mongodb connections object가 저장되어 있음
	//즉, database { init: [Function], db: 커넥션 객체} console.log(database) 해보면 나옴
	database.db.on('error', console.error.bind(console, 'mongoose connection error'));
	database.db.on('open', function(){//open인자는 어디서 가져오는 거지?
		console.log('Connected DB: '+ config.db_url);

		createSchema(app. config);
	});
	database.db.on('disconnected', connect);
}

function createSchema(app, config){
	var schemaLen = config.db_schemas.length;
	console.log('설정에 정의된 스키마 수: %d', schemaLen);

	for(var i=0; i<schemaLen, i++){
		var curItem = config.db_schemas[i];//{file:'./user_schema', collection:'users3', schemaName:'UserSchema', modelName:'UserModel'}
		var curSchema = require(curItem.file).createSchema(mongoose);//require('./user_schema').createSchema(mongoose);
		//즉, Schema.createSchema(mongoose) 가 되는 듯. ./user_shema.js에서 module.exports = Schema로 했으니까
		console.log('%s 모듈을 불러들인 후 스키마 정의함', curItem.file);// ./user_schema에서 console.log(Schema);했더니 { createSchema: [Function] }나옴
		var curModel = mongoose.model(curItem.collections, curSchema);//(users3, Schema를 가리키는 객체)
		console.log('%s 컬렉션을 위해 모델 정의함', curItem.collection);//user3

		database[curItem.schemaName] = curSchema;
		database[curItem.modelName] = curModel;
		console.log('Add database obj property, Schema Name: [%s], Model Name: [%s]', curItem.schemaName, curItem.modelName);//UserSchema, UserModel	
	}
	app.set('database', database);
	console.log('database 객체가 app 객체의 속성으로 추가됨');//처음보는 방식
}

module.exports = database;