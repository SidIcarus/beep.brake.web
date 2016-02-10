var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("This got hit");
  res.json({message: "Yeah. API"});
});

module.exports = router;
