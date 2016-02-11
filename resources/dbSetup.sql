CREATE TABLE appuser(
    deviceId text PRIMARY KEY
);

CREATE TABLE configuration(
	id serial PRIMARY KEY,
	warningtime integer
);

CREATE TABLE event(
	Id serial PRIMARY KEY,
	userid text REFERENCES appuser,
	hardware text,
	appversion text,
	osversion text,
	config integer REFERENCES configuration,
	eventdate timestamp
);

CREATE TABLE segment(
	id serial PRIMARY KEY,
	eventid integer REFERENCES event,
	segtime timestamp
);

CREATE TABLE numsensordata(
	id serial PRIMARY KEY,
	segid integer REFERENCES segment,
	key text,
	value float8
);

CREATE TABLE boolsensordata(
	id serial PRIMARY KEY,
	segid integer REFERENCES segment,
	key text,
	value bool
);

CREATE TABLE stringsensordata(
	id serial PRIMARY KEY,
	segid integer REFERENCES segment,
	key text,
	value text
);

CREATE TABLE webuser(
	id serial PRIMARY KEY,
	username text UNIQUE,
	password text,
	role text
);