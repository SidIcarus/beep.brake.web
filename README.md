On Ubuntu Linux

1. Install Nodejs and npm
  * https://nodejs.org/en/download/package-manager/
2. Pull repository
  * Git clone (repo.git);
3. Install dependencies
  1. Enter project root folder
    * “Npm install”
  2. Install postgres
    * sudo apt-get install postgresql postgresql-contrib
  3. Log into postgres user
    * Sudo -i -u postgres
  4. Create database and user
    1. Createdb #name
    2. Createuser --interactive
      * Use the same name as your ubuntu account
      * Superuser yes
  5. Exit back to linux user
  6. Add database tables
    * Psql -d #name -a -f resources/dbSetup.sql
4. Update database connection string in db.js
    * postgres://postgres:#name@localhost/#name
5. Return to project root
6. npm start
