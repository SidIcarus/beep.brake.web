var express = require('express');
var router = express.Router();
var pg = require('pg');
var async = require('async');
var multer = require('multer');
var dbString = require('../db.js');
var crypto = require('crypto');
var conString = dbString.dbString;
var tempSalt = "beep.brake.salt";


router.post('/register', function(req, res) {
  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }

    var newWebUser = req.body;
    //Check for unique username
    client.query({
      text   : 'SELECT EXISTS(SELECT 1 FROM webuser WHERE username=$1)',
      name   : 'Webuser Unique check',
      values : [newWebUser.username]
    }, function(err, result) {  
      if (err) {
        done()
        console.log(err);
        res.status(500).send({"message": "Internal server error"});
        return;
      }
      if (result.rows[0].exists) {
        done();
        return res.status(400).send({"message": "User already registered"})
      } else {
        var saltHashPass = (crypto.createHash('sha256').update(newWebUser.password+tempSalt).digest('hex'));
        client.query({
          text   : 'INSERT INTO webuser VALUES(DEFAULT, $1, $2, $3)',
          name   : 'Webuser Registration',
          values : [newWebUser.username, saltHashPass, newWebUser.role]
        }, function(err, results) {
          done();
          if (err) {
            console.log(err);
            res.status(500).send({'message': 'Internal server error'});
          } else {
            res.status(201).send();
          }
        })
      }

    })
  })
})

router.get('/events', function(req, res) {
  pg.connect(conString, function(err, client, done) {
    client.query ({
      text   : "SELECT * FROM event ORDER BY id",
      name   : "Get Events"
    }, function(err, results) {
      done();
      res.status(200).json(results.rows);
    });
  });
});

//Get event segments and sensor data for specific event
router.get('/event/:id', function(req, res) {
  var queue = []
  var segrows = {}
  segrows.sensordata = []

  pg.connect(conString, function(err, client, done) {
    client.query ({
      text   : "SELECT * FROM segment WHERE eventid=$1",
      name   : "Get Event by id",
      values : [req.params.id]
    }, function(err, segresults) {
      if (err) {
        console.log(err);
        return res.status(400);
      }

      for (var i = 0; i < segresults.rows.length; i++) {
        queue.push(client.query.bind(client, "SELECT * FROM numsensordata WHERE segid=$1",[segresults.rows[i].id]));
        queue.push(client.query.bind(client, "SELECT * FROM boolsensordata WHERE segid=$1",[segresults.rows[i].id]));
        queue.push(client.query.bind(client, "SELECT * FROM stringsensordata WHERE segid=$1",[segresults.rows[i].id]))
      }

      async.series(queue, function(err, results) {
        segrows.segments = segresults.rows;
        for (var i in results) {
          for (var j in results[i].rows) {
            segrows.sensordata.push(results[i].rows[j])
          }
        }
        done();
        res.status(200).json(segrows);
      })
    });
  });
});

router.get('/users/', function(req, res) {
 pg.connect(conString, function(err, client, done) {
  client.query({
    text : "SELECT id, username, role FROM webuser",
    name : "User Query"
  }, function(err, results) {
    done();
    res.status(200).json(results.rows);
  });
 });
});

router.delete('/user/:id', function(req, res) {
  pg.connect(conString, function(err, client, done) {
    client.query({
      text   : "DELETE FROM webuser WHERE id=$1",
      name   : "Delete User",
      values : [req.params.id]
    }, function(err, results) {
      if (err) {
        console.log(err);
        res.send(500);
      } else {
        res.send(200);
      }
    });
  });
}); 

module.exports = router;