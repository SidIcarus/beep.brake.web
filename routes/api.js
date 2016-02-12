var express = require('express');
var router = express.Router();
var pg = require('pg');

var conString = "postgres://postgres:1234@localhost/postgres";

//Stores new Device Id
router.post('/newDevice', function(req, res) {
  if (!req.body.deviceId) {
      return res.status(400).send({"status": "error", "message": "No deviceId provided"})
  }

  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }

    //Check for uniqueness. If unique, store, otherwise, send 400
    client.query({
      text   : 'SELECT EXISTS(SELECT 1 FROM appuser WHERE deviceid=$1)',
      name   : "Unique Check",
      values : [req.body.deviceId]
    }, function(err, result) {
      if (result.rows[0].exists) {
        return res.status(400).send({"message" : "Device already registered"})
      } else {
        client.query({
          text   : "INSERT INTO appuser VALUES($1)",
          name   : "Device-Registration",
          values : [req.body.deviceId] 
        }, function(err, result) {
          res.status(201).send({"message" : "Device Registered"})
        });
      }
    });  
  });
});

router.post('/newEvent', function(req,res) {
  console.log(req.body);
  if (!req.body.deviceId) {
      return res.status(400).send({"status": "error", "message": "No deviceId provided"})
  }

  //check DB for existing deviceId

  //Parse and store event in db

  res.status(200).send({"message": "Success"});
});

module.exports = router;
