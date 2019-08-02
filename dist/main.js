/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./server.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./server.js":
/*!*******************!*\
  !*** ./server.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Get our dependencies
var express = __webpack_require__(/*! express */ "express");
var app = express();
var mysql = __webpack_require__(/*! mysql */ "mysql");
var os = __webpack_require__(/*! os */ "os");
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


console.log("server listening through port: " + process.env.PORT);
// Launch our API Server and have it listen on specified port .
app.listen(process.env.PORT);
module.exports = app;


/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "mysql":
/*!************************!*\
  !*** external "mysql" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("mysql");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ })

/******/ });
//# sourceMappingURL=main.js.map