var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");//암호화 방식
var hasher = bkfd2Password();
var passport = require('passport');//인증 모듈
var LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const conn = mysql.createConnection({
	host	: 'localhost',//수정 필요
	user 	: 'root',
	password: '111111',
	database: 'o2'
});
conn.connect();

var app = express();
app.use(bodyParser.urlencoded({ extended: false}));

/** session **/
app.use(session({
  secret: '1234SADF@#%fdjgkl',//session id를 심을 때, 키같은 것
  resave: false,//세션id를 새로 접속할 때마다 재발급하지 않는다
  saveUninitialized: true,//세션을 id를 세션을 실제로 사용하기 전까지는 발급하지 말아라
  store: new MySQLStore({
  	host: 'localhost',//수정 필요
    port: 3306,
    user: 'root',
    password: '111111',
    database: 'o2'
  })
}));
app.use(passport.initialize());
app.use(passport.session());//인증할 때 세션을 사용하겠다(반드시 app.use(session({})))뒤에 나와야한다

/** Login + Authentication **/
var auth = require('./routes/login')(hasher, passport, LocalStrategy);
app.use('/auth', auth);

/** Logout **/
app.get('/auth/logout', function(req, res){
  req.logout();//세션에 있는 데이터를 패스포트가 제거해줌
  req.session.save(function(){//작업이 끝난 후 조금 더 안전하게 웰컴페이지로 리다이렉션
    res.redirect('/welcome');
  });
});
/** Welcome **/
app.get('/welcome', function(req, res){
  if(req.user && req.user.displayName){//로그인에 성공 했다면, 해당 사용자의 개인화된 화면을 보여줄 수 있다
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a>
    `);
  } else {
    res.send(`
      <h1>welcome</h1>
      <ul>
        <li><a href="/auth/login">login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
    `);
  }
});

/** Register **/
app.get('/auth/register', function(req, res){
  var output = `
  <h1>Register</h1>
  <form action="/auth/register" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="text" name="displayName" placeholder="displayName">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output);
});
app.post('/auth/register', function(req, res){
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

app.listen(3003, function(){//수정 필요
  console.log('Connected 3003 port!!!');
});