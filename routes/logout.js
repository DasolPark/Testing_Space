var express = require('express');
var router = express.Router();

router.get('/auth/logout', function(req, res){
  req.logout();//세션에 있는 데이터를 패스포트가 제거해줌
  req.session.save(function(){//작업이 끝난 후 조금 더 안전하게 웰컴페이지로 리다이렉션
    res.redirect('/welcome');
  });
});

return router;