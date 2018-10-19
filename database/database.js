var mongoose = require('mongoose');
var database = {};
database.init = function(app, config){//여기서 init함수를 실행하면서 db객체를 가져오나?
	console.log('init() called');
	connect(app, config);
}

function connect(app, config){
	console.log('connect() called');

	mongoose.Promise = global.Promise;
	mongoose.connect(config.db_url);
	database.db = mongoose.connection;

	database.db.on('error', console.error.bind(console, 'mongoose connection error'));
	database.db.on('open', function(){
		console.log('Connected database: '+config.db_url);
		createSchema(app, config);
	});
	database.db.on('disconnected', connect);//???? connect는 function인가? 뭔가?
}

function createSchema(app, config){
	var schemaLen = config.db_schemas.length;
	console.log('Schemas length: %d', schemaLen);

	for(var i=0; i<schemaLen; i++){
		var curItem = config.db_schemas[i];//{file:'./user_shema', collection:'users3', schemaName:'Userschema', modelName:'UserModel'}
		//curItem은 config.db_schemas[i]번째 주소를 가지고 있음(현재 i=0)
		var curSchema = require(curItem.file).createSchema(mongoose);
		console.log('Define %s file ', curItem.file);

		var curModel = mongoose.model(curItem.collection, curSchema);
		console.log('Define Model for %s collection' curItem.collection);

		database[curItem.schemaName] = curSchema;//database['UserSchema'->2??] -> 객체 주소?
		database[curItem.modelName] = curModel;//database['UserModel'->3??] ->3??
		console.log('added database object property, Schema Name [%s], Model Name [%s] ', curItem.schemaName, curItem.modelName);
	}
	app.set('database', database);//
	console.log('added app object property, database object');//???????
}

module.exports = database;
//database[0] = mongodb db obj
//