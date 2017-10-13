var fs = require("fs");
var path = require("path");
var models = {};
var mongoose = require('mongoose');
var dbconfig = require('../config/database.js');
var db = mongoose.connect(dbconfig.url);
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var modelname = require(path.join(__dirname, file));
    var name = file.replace(/\.[^/.]+$/, "");
    models[name] = modelname;
  });
module.exports = models;
