'use strict';

// Get our dependencies
var express = require('express');
var app = express();
var mysql = require("mysql");
var os = require('os');
var ifaces = os.networkInterfaces();


var db_config = {
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME,
 
 };

var connection;

function getIpAdresses(){

  var ipAdresses= "";
  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;
  
    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
  
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        ipAdresses += ifname + ': ' + alias, iface.address ;
      } else {
        // this interface has only one ipv4 adress
        ipAdresses += ifname+ ': ' + iface.address;
  
      }
      ++alias;
    });
    
  });
  
  return ipAdresses;
};

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

connection.on('error', function(err) {
  console.log('db error', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
    handleDisconnect();                         // lost due to either server restart, or a
  } else {                                      // connnection idle timeout (the wait_timeout
    throw err;                                  // server variable configures this)
  }
});

function getMovies(callback) {    
       connection.query("SELECT * FROM movie_db.moviereview",
           function (err, rows) {
               callback(err, rows); 
           } 
       );    
} 

function getReviewers(callback) {    
  connection.query("SELECT * FROM movie_db.reviewer",
      function (err, rows) {
          callback(err, rows); 
      } 
  );    
} 

function getPublications(callback) {    
  connection.query("SELECT * FROM movie_db.publication",
      function (err, rows) {
          callback(err, rows); 
      } 
  );    
} 

function getPendings(callback) {    
  connection.query("SELECT * FROM movie_db.pending",
      function (err, rows) {
          callback(err, rows); 
      } 
  );    
} 

//Testing endpoint
app.get('/', function(req, res){
  var response = [{response : 'hello'}, {code : '200'}]
  res.json(response);
})

app.get('/movies', function(req, res, next) {   
   getMovies(function (err, moviesResult){
      if(err){
        res.status(500).send('Error in the database');   
      }else{
        res.json(moviesResult);
      }
   });
});


app.get('/reviewers', function(req, res, next) {   
  getReviewers(function (err, reviewersResult){
    if(err){
      res.status(500).send('Error in the database');   
    }else{
      res.json(reviewersResult);
    }
 });
});



app.get('/publications', function(req, res, next) {   
  getPublications(function (err, publicationsResult){
    if(err){
      res.status(500).send('Error in the database');   
    }else{
      res.json(publicationsResult);
    }
 });
});

app.get('/pending', function(req, res, next) {   
  
  getPendings(function (err, pendingResult){
    
    if(err){
      res.status(500).send('Error in the database');   
    }else{
      res.json(pendingResult);
    }
 });
});

app.get('/ip', function(req, res, next) {   
  
  var ip = getIpAdresses();
  res.json(ip);
});


console.log("server listening through port:  " + process.env.PORT);
// Launch our API Server and have it listen on specified port .
app.listen(process.env.PORT);
module.exports = app;
