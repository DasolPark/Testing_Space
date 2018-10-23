/** welcome **/
var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/welcome', function(req, res){
  fs.readFile('public/welcome.html',(err,data)=>{
      res.end(data);
  });
});

router.get('/welcome/admin',function(req,res){
  if(req.user && req.user.displayName){//로그인에 성공 했다면, 해당 사용자의 개인화된 화면을 보여줄 수 있다
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a>
      <a href="/manager/menu">Menu Management</a>
    `);
  }
});

module.exports = router;