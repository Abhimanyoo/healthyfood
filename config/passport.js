var flash = require('connect-flash');

module.exports = function(passport, models) {
  var User = models.user;
  var LocalStrategy = require('passport-local').Strategy;


  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(_id, done) {
    User.findById(_id, function(err, user) {
      if (err) {
        console.error('There was an error accessing the records of' +
          ' user with id: ' + _id);
        return console.log(err.message);
      }
      return done(null, user);
    });

  });

  //---------------------------Local Strategy-------------------------------------
  passport.use('local-signup', new LocalStrategy(

    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    function(req, username, password, done) {
      process.nextTick(function() {
        User.findOne({
          username: username
        }, function(err, user) {
          if (err) {
            console.log("error in User.findOne passport js" + err);
            return done(err);
          }
          if (user) {
            console.log('That username is already taken');
            return done(null, false, req.flash('message', 'That username is already taken'));
          } else {
            //var userPassword = generateHash(city=password);
            var newUser = new User();
            newUser.city = req.body.city;
            newUser.country = req.body.country;
            newUser.adress = req.body.adress;
            newUser.postcode = req.body.postcode;
            newUser.username = username;
            newUser.email = req.body.email;
            newUser.password = newUser.generateHash(password);
            newUser.firstname = req.body.firstname;
            newUser.lastname = req.body.lastname;
            newUser.about = req.body.about;

            newUser.save(function(err) {
              if (err) {
                console.log('error in saving user: ' + err);
                return done(null, false);
              }
              return done(null, newUser);
            });
          }
        });

      });
    }
  ));

  //LOCAL SIGNIN
  passport.use('local-signin', new LocalStrategy(

    {
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    function(req, username, password, done) {

      var criteria = (username.indexOf('@') === -1) ? {
        username: username
      } : {
        email: username
      }

      User.findOne(criteria, function(err, user) {
        if (err) {
          return done(err)
        }

        if (!user) {
          return done(null, false, req.flash('warning', 'No such username.'));
        }

        if (!user.validPassword(password)) {

          return done(null, false, req.flash('warning', 'Incorrect password.'));

        }
        return done(null, user);

      }).catch(function(err) {

        console.log("Error:", err);

        return done(null, false, {
          error: 'Something went wrong with your Signin'
        });


      });

    }));

}
