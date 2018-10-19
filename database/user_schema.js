var crypto = require('crypto');
var Schema = {};

Schema.createSchema = function(mongoose){
	var UserSchema = mongoose.Schema({
		id: {type: String, required: true, unique: true, 'default':''},
		hashed_password: {type: String, required: true, 'default':''},
		salt: {type: String, required: true},
		name: {type: String, index: 'hashed', 'default':''},
		age: {type: Number, 'default': -1},
		created_at: {type: Date, index: {unique: false}, 'default': Date.now},
		updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
	});

	UserSchema
		.virtual('password')
		.set(function(password){
			this._password = password;
			this.salt = this.makeSalt();
			this.hashed_password = this.encryptPassword(password);
			console.log('Called virtual password: '+ this.hashed_password);
		});
		.get(function(){ return this._password});//hashed_password에 암호화 다 해놓고 왜 이걸 리턴하지?

		UserSchema.method('encryptPassword', function(plainText, inSalt){
			if(inSalt){
				return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
			} else {
				return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
			}
		});

		UserSchema.method('makeSalt', function(){
			return Math.round((new Date().valueOf() * Math.random())) + '';
		});

		UserSchema.method('authenticate', function(plainText, inSalt, hashed_password){
			if(inSalt){
				console.log('Called authenticate: %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), hashed_password);
				return this.encryptPassword(plainText, inSalt) === hashed_password;
			} else {
				console.log('Called authenticate: %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), this.hashed_password);
				return this.encryptPassword(plainText, inSalt) === hashed_password;	
			}
		});
		var validatePresendceOf = function(value) {
			return value && value.length;
		};

		UserSchema.pre('save', function(next){
			if(!this.isNew) return next();

			if(!validatePresendceOf(this.password)){
				next(new Error('Unvalidate password'));
			} else {
				next();
			}
		});

		UserSchema.path('id').validate(function(id){
			return id.length;
		}, 'Not exist id column');
		UserSchema.path('name').validate(function(name){
			return name.length;
		}, 'Not exist name column');
		UserSchema.path('hashed_password').validate(function(hashed_password){
			return hashed_password.length;
		}, 'Not exist hashed_password column');
		
		UserSchema.static('findById', function(id, callback){
			return this.find({id:id}, callback);
		});
		UserSchema.static('findAll', function(callback){
			return this.find({}, callback);
		});//이건 어디서 쓰이는 거지?
		console.log('Defined UserSchema');

		return UserSchema;
}

module.exports = Schema;