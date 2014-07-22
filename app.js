/*************************************************************
 *
 * Developed by : Tinniam V Ganesh         Date: 22 July 2014
 * Using PostgreSQL DB in Bluemix
 * 
 ************************************************************/
var pg = require("pg")
var http = require("http")

if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var credentials = env['postgresql-9.1'][0]['credentials'];
} else {
  var credentials = {"uri":"postgre://user:secret1@localhost:5433/db"}
}


var port = (process.env.VCAP_APP_PORT || 1337);
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');

//Insert 2 records into the emps table
var insert_records = function(req, res) {
   console.log("In insert");
   // Connect to DB
   var client = new pg.Client(credentials.uri);
  client.connect(function(err) {
    if (err) {
      res.end("Could not connect to postgre: " + err);
    }
   //Drop table if it exists
   client.query("DROP TABLE IF EXISTS emps");

   // Creat table and insert 2 records into it
   client.query("CREATE TABLE IF NOT EXISTS emps(firstname varchar(64), lastname varchar(64))");
   client.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Tinniam', 'Ganesh']);
   client.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Anand', 'Karthik']);

   // Write output
   res.writeHead(200, {'Content-Type': 'text/plain'});
   res.write("2 records is inserted.\n");
   res.end();
   console.log("Inserted 2 records");
   });
 }


// List records the records in the emps table
var list_records = function(req, res) {
   console.log("In listing records");

  // Connect to DB
 var client = new pg.Client(credentials.uri);
  client.connect(function(err) {
    if (err) {
      res.end("Could not connect to postgre: " + err);
    }

  // Select all rows in the table
  var query = client.query("SELECT firstname, lastname FROM emps ORDER BY lastname, firstname");
  query.on("row", function (row, result) {
    	 result.addRow(row);
   });
   query.on("end", function (result) {
      
   // On end JSONify and write the results to console and to HTML output
   console.log(JSON.stringify(result.rows, null, "    "));
    	res.writeHead(200, {'Content-Type': 'text/plain'});
    	res.write(JSON.stringify(result.rows) + "\n");
    	res.end();
   });
 });
}

// Update a record in the emps table
var update_record = function(req, res) {
    console.log("In update");

    // Connect to DB
    var client = new pg.Client(credentials.uri);
  client.connect(function(err) {
    if (err) {
      res.end("Could not connect to postgre: " + err);
    }


    // Update the record where the firstname is Anand
    query = client.query("UPDATE emps set firstname = 'Kumar' WHERE firstname='Anand' AND lastname='Karthik'");
     	res.writeHead(200, {'Content-Type': 'text/plain'});
     	res.write("Updated record  - Set record with firstname Anand to Kumar\n");
     	res.end();
    console.log("Updated record - Set record with firstname Anand to Kumar");
   });
 }

//Delete record
var delete_record = function(req, res) {
   console.log("In delete");

   // Connect to DB
  var client = new pg.Client(credentials.uri);
  client.connect(function(err) {
    if (err) {
      res.end("Could not connect to postgre: " + err);
    }

    // Delete the record where the lastname is Karthik
    client.query("DELETE FROM  emps WHERE lastname = 'Karthik'");
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("Deleted record where lastname was Karthik\n");
    res.end();
    console.log("Deleted record where lastname was Karthik");
  });
}


http.createServer(function(req, res) {
  console.log("Inside Webserver");
 
 // Perform CRUD operations through REST APIs
 if(req.method == 'POST') {
            insert_records(req,res);
     }
     else if(req.method == 'GET') {
         list_records(req,res);
     }
     else if(req.method == 'PUT') {
         update_record(req,res);
     }
     else if(req.method == 'DELETE') {
         delete_record(req,res);
     }

 }).listen(port, host);
console.log("Connected to port =" + port + "host =  " + host);
