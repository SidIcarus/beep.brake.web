var express = require('express');
var router = express.Router();
var pg = require('pg');
var async = require('async');
var dbString = require('../db.js');
var conString = dbString.dbString;

//Stores new Device Id
router.post('/newDevice', function(req, res) {
  if (!req.body.deviceid) {
      return res.status(400).send({"status": "error", "message": "No deviceid provided"})
  }

  pg.connect(conString, function(err, client, done) {
    if (err) {
      return console.error('error fetching client from pool', err);
    }

    //Check for uniqueness. If unique, store, otherwise, send 400
    client.query({
      text   : 'SELECT EXISTS(SELECT 1 FROM appuser WHERE deviceid=$1)',
      name   : "Unique Check",
      values : [req.body.deviceid]
    }, function(err, result) {
      if (result.rows[0].exists) {
        done();
        return res.status(400).send({"message" : "Device already registered"})
      } else {
        client.query({
          text   : "INSERT INTO appuser VALUES($1)",
          name   : "Device-Registration",
          values : [req.body.deviceId] 
        }, function(err, result) {
          res.status(201).send({"message" : "Device Registered"})
          done();
        });
      }
    });  
  });
});

router.post('/newEvent', function(req,res) {
  var newEvent = req.body;
  if (!req.body.deviceid) {
      return res.status(400).send({"status": "error", "message": "No deviceId provided"})
  }

  pg.connect(conString, function(err, client, done) {
    //check DB for existing deviceid
    client.query({
      text   : 'SELECT EXISTS(SELECT 1 FROM appuser WHERE deviceid=$1)',
      name   : "Unique Check",
      values : [req.body.deviceid]
    }, function(err, result) {
      //Continue if device is registered
      if (result.rows[0].exists) {

        //Parse and store event in db
        console.log("Add event");
        client.query({ 
          text   : "INSERT INTO event VALUES (DEFAULT, (SELECT deviceid FROM appuser WHERE deviceid=$1), $2, $3, $4, (SELECT id FROM configuration WHERE id=1), $5) RETURNING id",
          name   : "Event Creation",
          values : [newEvent.deviceid, newEvent.hardware, newEvent.appversion, newEvent.osversion, new Date(newEvent.eventdate)]
        }, function(err, results) {

          if (err) {
            console.log(err);
            return res.send(400);
          }
          //for each segment insert segment and insert all sensor data
          for (var s = 0; s < newEvent.segments.length; s++) {
            segCreate(results.rows[0].id, newEvent.segments[s]);
          }

          done();
          return res.status(201).send({"message": "Success"});
        }) 
      } else {
        done();
        return res.status(400).send({"message" : "Device not registered"})
      }
    });
  });
});

function segCreate(eventid, segment) {
  pg.connect(conString, function(err, client, done) {
    client.query({ 
        text   : "INSERT INTO segment VALUES (DEFAULT, (SELECT id FROM event WHERE id=$1), $2) RETURNING id",
        name   : "Segment Creation",
        values : [eventid, new Date(segment.segtime)]
      }, function(err, results) {

        if (err) {
          console.log(err);
          return;
        }

        for (var i = 0; i < segment.data.length; i++) {
          switch(typeof(segment.data[i].value)) {
            case 'boolean':
              client.query({
                text   : "INSERT INTO boolsensordata VALUES (DEFAULT, (SELECT id FROM segment WHERE id=$1), $2, $3)",
                name   : "Bool Sensor Data Creation",
                values : [results.rows[0].id, segment.data[i].key, segment.data[i].value]
              }, function(err, results) {
                if (err) {
                  console.log(err);
                }
              })
              break;
            case 'number':
              client.query({
                text   : "INSERT INTO numsensordata VALUES (DEFAULT, (SELECT id FROM segment WHERE id=$1), $2, $3)",
                name   : "Num Sensor Data Creation",
                values : [results.rows[0].id, segment.data[i].key, segment.data[i].value]
              }, function(err, results) {
                if (err) {
                  console.log(err);
                }
              })
              break;
            case 'string':
              client.query ({
                text   : "INSERT INTO stringsensordata VALUES (DEFAULT, (SELECT id FROM segment WHERE id=$1), $2, $3)",
                name   : "String Sensor Data Creation",
                values : [results.rows[0].id, segment.data[i].key, segment.data[i].value]
              }, function(err, results) {
                if (err) {
                  console.log(err);
                }
              })
              break;
            default:
              console.log("Invalid type");
          }
        }
      })
  });

}

//Get all events
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
    text : "SELECT username, role FROM webuser",
    name : "User Query"
  }, function(err, results) {
    done();
    res.status(200).json(results.rows);
  });
 });
});

module.exports = router;
