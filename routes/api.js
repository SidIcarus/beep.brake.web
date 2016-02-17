var express = require('express');
var router = express.Router();
var pg = require('pg');

var conString = "postgres://postgres:1234@localhost/postgres";

//Stores new Device Id
router.post('/newDevice', function(req, res) {
  if (!req.body.deviceId) {
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
        var d = new Date();
        var n = d.getTime();
        var u = new Date(n);

        client.query({ 
          text   : "INSERT INTO event VALUES (DEFAULT, (SELECT deviceid FROM appuser WHERE deviceid=$1), $2, $3, $4, (SELECT id FROM configuration WHERE id=1), $5) RETURNING id",
          name   : "Event Creation",
          values : [newEvent.deviceid, newEvent.hardware, newEvent.appversion, newEvent.osversion, u]
        }, function(err, results) {
          //console.log(results.rows[0].id);
          var p = new Date(new Date().getTime());
          for (var s = 0; s < newEvent.segments.length; s++) {
            var segment = newEvent.segments[s];
            client.query({ 
              text   : "INSERT INTO segment VALUES (DEFAULT, (SELECT id FROM event WHERE id=$1), $2) RETURNING id",
              name   : "Segment Creation",
              values : [results.rows[0].id, p/*segment.segtime*/]
            }, function(err, results) {
              for (var i = 0; i < segment.data.length; i++) {
                var segData = segment.data[i];
                switch(typeof(segData.value)) {
                  case 'boolean':
                    console.log("bool");
                    client.query({
                      text   : "INSERT INTO boolsensordata VALUES (DEFAULT, (SELECT id FROM segment WHERE id=$1), $2, $3)",
                      name   : "Bool Sensor Data Creation",
                      values : [results.rows[0].id, segData.key, segData.value]
                    })
                    break;
                  case 'number':
                    console.log("NUMBER");
                    client.query({
                      text   : "INSERT INTO numsensordata VALUES (DEFAULT, (SELECT id FROM segment WHERE id=$1), $2, $3)",
                      name   : "Num Sensor Data Creation",
                      values : [results.rows[0].id, segData.key, segData.value]
                    })
                    break;
                  case 'string':
                    console.log("STRING");
                    client.query ({
                      text   : "INSERT INTO stringsensordata VALUES (DEFAULT, (SELECT id FROM segment WHERE id=$1), $2, $3)",
                      name   : "String Sensor Data Creation",
                      values : [results.rows[0].id, segData.key, segData.value]
                    })
                    break;
                  default:
                    console.log("Invalid type");
                }
              }

              done();
              return res.status(201).send({"message": "Success"});
            })
          }
        }) 
      } else {
        done();
        return res.status(400).send({"message" : "Device not registered"})
      }
    });
  });
});
  
router.post('/login', function(req, res) {
  res.status(200).send();
});

router.get('/events', function(req, res) {
  pg.connect(conString, function(err, client, done) {
    client.query ({
      text   : "SELECT * FROM event ORDER BY id",
      name   : "Get Events"
    }, function(err, results) {
      console.log(results.rows)
      done();
      res.status(200).json(results.rows);
    });
  });
});

router.get('/event/:id', function(req, res) {
  pg.connect(conString, function(err, client, done) {
    client.query ({
      text   : "SELECT * FROM event INNER JOIN segment ON (event.id = segment.eventid)WHERE event.id=$1",
      name   : "Get Event by id",
      values : [req.params.id]
    }, function(err, results) {
      console.log(err);
      done();
      res.status(200).json(results.rows);
    });
  });
});

module.exports = router;
