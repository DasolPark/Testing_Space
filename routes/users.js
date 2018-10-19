var login = function(req, res){
	console.log('Called login module in user(user2.js)');

	var paramId = req.body.id;
	var paramPassword = req.body.password;

	console.log('request parameter: ' + paramId + ', ' + paramPassword);

	var database = req.app.get('database'); //이게 진짜 모르겠따

	if(database.db){
		authUser(database, paramId, paramPassword, function(err, docs){
			if(err){
				console.err('User Login Process Error: '+ err.stack);

				res.writeHead('200', {'Content-Type':'text/html; charset=utf8'});
				res.write('<h2>User Login Process Error</h2>');
				res.write('<p>' + err.stack + '</p>');
				res.end();

				return;
			}
			if(docs){
				console.dir(docs);

				var username = docs[0].name;

				res.writeHead('200', {'Content-Type':'text/html; charset=utf8'});
				res.write('<h1> Success Login</h1>');
				res.write('<div><p>User ID: '+ paramId+ '</p></div>');
				res.write('<div><p>User Name: '+ username+ '</p></div>');
				res.write("<br><br><a href='/public/login.html'>Retry login</a>");
				res.end();
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h1>로그인  실패</h1>');
				res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
				res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
				res.end();
			} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
					res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
					res.write('<h2>데이터베이스 연결 실패</h2>');
					res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
					res.end();
				}
		});
	}
}//end login

var adduser = function(req, res){
	console.log('Called adduser in user(user2.js) module');

	var paramId = req.body.id;
	var paramPassword = req.body.password;
	var paramName = req.body.name;

	console.log('Request parameter: '+ paramId+ ', '+ paramPassword+ ', '+ paramName);

	var database = req.app.get('database');

	if(database.db){
		adduser(database, paramId, paramPassword, paramName, function(err, addedUser){
			if(err){
				console.error('사용자 추가 중 에러 발생 : ' + err.stack);
                
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가 중 에러 발생</h2>');
        res.write('<p>' + err.stack + '</p>');
				res.end();
                
        return;
			}
			if(addedUser){
				console.dir(addedUser);

				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가 성공</h2>');
				res.end();
			} else {  // 결과 객체가 없으면 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 추가  실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
}

var listuser = function(req, res){
	console.log('Called listuser in user(user2.js) module');

	var database = req.app.get('database');
		if (database.db) {
		// 1. 모든 사용자 검색
		database.UserModel.findAll(function(err, results) {
			// 에러 발생 시, 클라이언트로 에러 전송
			if (err) {
        console.error('사용자 리스트 조회 중 에러 발생 : ' + err.stack);
                
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회 중 에러 발생</h2>');
        res.write('<p>' + err.stack + '</p>');
				res.end();
                
        return;
      }
			  
			if (results) {
				console.dir(results);
 
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트</h2>');
				res.write('<div><ul>');
				
				for (var i = 0; i < results.length; i++) {
					var curId = results[i]._doc.id;
					var curName = results[i]._doc.name;
					res.write('    <li>#' + i + ' : ' + curId + ', ' + curName + '</li>');
				}	
			
				res.write('</ul></div>');
				res.end();
			} else {
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회  실패</h2>');
				res.end();
			}
		});
	} else {
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}	
};

var authUser = function(database, id, password, callback) {
	console.log('authUser 호출됨.');
	
	// 1. 아이디를 이용해 검색
	database.UserModel.findById(id, function(err, results) {
		if (err) {
			callback(err, null);
			return;
		}		
		console.log('아이디 [%s]로 사용자 검색결과', id);
		console.dir(results);
		
		if (results.length > 0) {
			console.log('아이디와 일치하는 사용자 찾음.');			
			// 2. 패스워드 확인 : 모델 인스턴스를 객체를 만들고 authenticate() 메소드 호출
			var user = new database.UserModel({id:id});
			var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);
			if (authenticated) {
				console.log('비밀번호 일치함');
				callback(null, results);
			} else {
				console.log('비밀번호 일치하지 않음');
				callback(null, null);
			}			
		} else {
	    	console.log("아이디와 일치하는 사용자를 찾지 못함.");
	    	callback(null, null);
	    }		
	});	
}

var addUser = function(database, id, password, name, callback) {
	console.log('addUser 호출됨.');
	
	// UserModel 인스턴스 생성
	var user = new database.UserModel({"id":id, "password":password, "name":name});

	// save()로 저장
	user.save(function(err) {
		if (err) {
			callback(err, null);
			return;
		}		
	  console.log("사용자 데이터 추가함.");
	  callback(null, user);	     
	});
}

module.exports.login = login;
module.exports.adduser = adduser;
module.exports.listuser = listuser;