var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Beep.Brake.Web' });
});

router.get('/dataView', function(req, res, next) {
  res.render('dataView', {title: 'Beep.Brake.Web Home'})
});

module.exports = router;
