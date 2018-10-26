/** mongoose CRUD example **/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/mongotest', {useNewUrlParser: true});
mongoose.connection.on('open', function(){
  console.log('Mongoose connected.');
});

var Account = new Schema({//Account에는 Schema 객체
  username: { type: String },
  date_created: { type: Date, default: Date.now },
  visits: { type: Number, default: 0 },
  active: { type: Boolean, default: false}
});
var AccountModel = mongoose.model('Account', Account);
//AccountModel에는 모델 만드는 함수(function medel(doc, fields, skipId){}

//추가하는 방법(Create document)
//var newUser = new AccountModel({ username: 'randomUser1' }); //newUser에는 도큐먼트 한 줄이 있음
//newUser.save();

//읽어오는 방법(Read document)
//AccountModel.find({}, function(err, accounts){
//  console.log(accounts.length);
//});

//수정하는 방법(Update document)
//var query = { username: 'randomUser1' };
//AccountModel.findOneAndDelete(query, { username: 'randomUser2' }  function(err, accounts){
//  console.log(accounts.length);
//});

//삭제하는 방법(Delete document)
//AccountModel.remove({ username: 'randomUser1' }, function(err, accounts){
//  console.log(accounts.length);
//});

//몽구스 종료(close mongoose)
//  mongoose.connection.close();