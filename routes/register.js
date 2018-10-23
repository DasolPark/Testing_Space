/** register **/
module.exports = function(hasher, conn){
	var express = require('express');
	var router = express.Router();
var fs = require('fs');

	router.get('/register', function(req, res){
		fs.readFile('public/register.html',(err,data)=>{
			if(err) console.log(err);
			else{
				res.end(data);
			}
		});
	});
	router.post('/register', function(req, res){
	  hasher({password: req.body.password}, function(err, pass, salt, hash){
	    var user = {
	      authId:'local:'+req.body.username,
	      username: req.body.username,
	      password: hash,
	      salt: salt,
	      displayName: req.body.displayName
	    };
	    var sql = 'INSERT INTO users SET ?';
	    conn.query(sql, user, function(err, results){//users테이블에 행이 추가되면 콜백 실행
	      if(err){
	        console.log(err);
	        res.status(500);
	      } else {
	        req.login(user, function(err){
	          req.session.save(function(){
	            res.redirect('/welcome');
	          });//회원가입이 되고 바로 로그인되어 사용할 수 있도록 구현
	        });
	      }
	    });
	  });
	});
	return router;
}