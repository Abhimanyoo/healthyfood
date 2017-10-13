  var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');

  var userSchema = mongoose.Schema({
    id: String,
    firstname: String,
    lastname: String,
    username: String,
    address: String,
    city: String,
    country: String,
    postcode: String,
    about: String,
    email: String,
    password: String,
    role: String,
    last_login: Date,
    status: String
  });

  /**
   *Schema methods
   */
  userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };


  module.exports = mongoose.model('User', userSchema);
