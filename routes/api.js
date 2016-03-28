var express = require('express');
var router = express.Router();
var pg = require('pg');
var async = require('async');
var multer = require('multer');
var dbString = require('../db.js');
var AdmZip = require('adm-zip');
var fs = require('fs');
var path = require('path');
var conString = dbString.dbString;
var upload = multer({ dest: './uploads/'});

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

//router.post('/newEvent', function(req,res) {
function newEvent(data, oldfile) {
  var newEvent = data;
  if (!newEvent.deviceid) {
      return {"status": 401, "message": "No deviceId provided"};
  }

  pg.connect(conString, function(err, client, done) {
    //check DB for existing deviceid
    client.query({
      text   : 'SELECT EXISTS(SELECT 1 FROM appuser WHERE deviceid=$1)',
      name   : "Unique Check",
      values : [newEvent.deviceid]
    }, function(err, result) {
      //Continue if device is registered
      if (result.rows[0].exists) {

        //Parse and store event in db
        console.log("Add event");
        client.query({ 
          text   : "INSERT INTO event VALUES (DEFAULT, (SELECT deviceid FROM appuser WHERE deviceid=$1), $2, $3, $4, (SELECT id FROM configuration WHERE id=1), $5) RETURNING id",
          name   : "Event Creation",
          values : [newEvent.deviceid, newEvent.hardware, newEvent.appversion, newEvent.osversion, new Date(newEvent.eventdata  )]
        }, function(err, results) {

          if (err) {
            console.log(err);
            return {"status" : 500};
          }
          //for each segment insert segment and insert all sensor data
          for (var s = 0; s < newEvent.segments.length; s++) {
            console.log("starting seg");
            segCreate(results.rows[0].id, newEvent.segments[s]);
          }

          console.log("RENAMING FOLDER");
          fs.rename("./events/" + oldfile, './events/' + results.rows[0].id, function(err) {
            if (err) {
              console.log(err);
              return;
            }
          });
          return {"status": 201};

        }) 
      } else {
        done();
        return {"message" : "Device not registered", "status" : 401}
      }
    });
  });
};
  
router.post('/newFile', upload.single('file'), function(req, res, next) {
  var zip = new AdmZip(req.file.path);

  zip.extractAllTo("./events/" + req.file.filename); 
  fs.readdir("./events/" + req.file.filename, function(err, list) {
    if (err){
      console.log(err);
      return res.status(500);
    }
    list.forEach(function (file) {
      fs.readFile(file, function(err, data) {
        console.log(file.toString());
        if (getExtension(file) == 'json') {
          
          try {
            var newJSON = JSON.parse(data);
          }catch (e) {
            console.log(e);
          }

          var result = newEvent(newJSON, req.file.filename) 

        }
      })
    })
  });

  res.status(204).end();
})

function getExtension(filename) {
  return filename.split('.').pop();
}

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

        for (var i = 0; i < segment.sensordata.length; i++) {
          console.log("Inserting data");
          switch(typeof(segment.sensordata[i].value)) {
            case 'boolean':
              client.query({
                text   : "INSERT INTO boolsensordata VALUES (DEFAULT, (SELECT id FROM segment WHERE id=$1), $2, $3)",
                name   : "Bool Sensor Data Creation",
                values : [results.rows[0].id, segment.sensordata[i].key, segment.sensordata[i].value]
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
                values : [results.rows[0].id, segment.sensordata[i].key, segment.sensordata[i].value]
              }, function(err, results) {
                if (err) {
                  console.log(err);
                }
              })
              break;
            case 'string':
              if (segment.sensordata[i].value.split('.').pop() == 'png') {
                segment.sensordata[i].value = segment.sensordata[i].value.split('/').pop();
              }
              client.query ({
                text   : "INSERT INTO stringsensordata VALUES (DEFAULT, (SELECT id FROM segment WHERE id=$1), $2, $3)",
                name   : "String Sensor Data Creation",
                values : [results.rows[0].id, segment.sensordata[i].key, segment.sensordata[i].value]
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
    done();
  });

}

module.exports = router;
