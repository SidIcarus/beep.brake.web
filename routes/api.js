var express = require('express');
var router = express.Router();
var pg = require('pg');

var conString = "postgres://postgres:1234@localhost/postgres";

router.get('/', function(req, res) {
  console.log("This got hit");

  pg.connect(conString, function(err, client, done) {
  	if (err) {
  		return console.error('error fetching client from pool', err);
  	}
  	console.log("Connected");
  })	

  res.json({message: "Yeah. API"});
});

router.post('/newDevice', function(req, res) {
	console.log(req.body);
	//Add device ID to database
	res.json({message: "Api Reached"})
});

router.post('/newEvent', function(req,res) {
	console.log(req.body);
	if (!req.body.deviceId) {
		return res.status(400).send({"status": "error", "message": "No deviceId provided"})
	}

	//check DB for existing deviceId

	//Parse and store event in db

	res.json({"message": "Success"});
});

module.exports = router;
