var multer = require('multer');
var path = require('path');
var fs = require('fs');
var flash = require('connect-flash');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({
  extended: true
});

module.exports = function(app, passport, models) {
  var User = models.user;

  app.post('/signup', passport.authenticate('local-signup', {
    failureFlash: true,
    successRedirect: '/',
    failureRedirect: '/signup'
  }));

  app.use(flash());
  app.get('/signup',  function(req, res) {
    res.render('signuppage.pug', {
      warning: req.flash('warnings'),
      error: req.flash('warnings')
    });
  });

  //++++++++++++++++++++++++++++++++++++++
  //+++++++++ LOGIN     ++++++++++++++++++
  //++++++++++++++++++++++++++++++++++++++
  app.get('/login', function(req, res) {
    res.render('signin.pug');
  });

  app.post('/login', function(req, res, next) {
    passport.authenticate('local-signin', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {

        return res.status(401).json({
          error: 'Authentication Failed'
        });
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.json({
          data: "Success"        });
      });
    })(req, res, next);
  });

  //++++++++++++++++++++++++++++++++++++++
  //+++++++++   CHECK LOGIN     +++++++++++
  //++++++++++++++++++++++++++++++++++++++
  function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())

      return next();

    res.redirect('/login');

  }

  //+++++++++   PROFILE        +++++++++++
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.pug', {
      user: req.user,
      navlinks: req.navlinks, // get the user out of session and pass to template
      warnings: req.flash('warnings'),
      messages: req.flash('messages'),
      userprofile: req.flash('userprofile')
    });
  });

  app.post('/editprofile', isLoggedIn,  urlencodedParser, function(req, res) {
    User.findById(req.body.id, function(err, edituser) {
      if (err) console.log(err);
      if (edituser != null) {
        edituser.city = req.body.city;
        edituser.country = req.body.country;
        edituser.adress = req.body.adress;
        edituser.postcode = req.body.postcode;
        edituser.username = edituser.username;
        edituser.email = edituser.email;
        edituser.password = (req.body.password) ? edituser.generateHash(req.body.password) : edituser.password;
        edituser.firstname = req.body.firstname;
        edituser.lastname = req.body.lastname;
        edituser.about = req.body.about;
        edituser.role = req.body.role;
        edituser.status = req.body.status;
        edituser.save(function(err, user) {
          if (err) {
            console.log('error in saving user: ' + err);
          }

        })
      } else {
        console.log('****nothing returned');
        req.flash("warnings", 'could not find the requested information');

      }

    })
  });

  //+++++++     LOG OUT     +++++++++++
  app.get('/logout',  function(req, res) {
    req.logOut();
    res.redirect('/');
  });

  //reading and return files in upload folder
  var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, './app/assets/uploads'); //destination for the uploaded files
    },
    filename: function(req, file, callback) {
      //fname = file.originalname.split('.').slice(-1, 1).join();
      //retain original name
      fname = file.originalname.split('.').shift();
      //rename uploaded file by adding date for unique identification
      //alternatively for the extansion use: '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
      callback(null, fname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  var upload = multer({
    storage: storage
  }).array('userUploads', 10);

  //fileupload
  app.post('/upload', isLoggedIn, function(req, res) {
    messages = []
    upload(req, res, function(err) {
      if (err) {
        req.flash('messages', [err]);
        res.redirect('/downloads')
      }
      req.flash('messages', "file is uploaded");
      res.redirect('/downloads');

    });
  });

  //+++++++++contact us page+++++++++++++
  app.get('/contact',  function(req, res) {
    res.render('contact.pug', {
      user: req.user,
      navlinks: req.navlinks, //so as to display username on the template
      errormsg: flash('warnings'), //any warnings
      successmsg: flash('successmsg')
    });
  });



  app.get('/*', function(req, res) {
    res.render('404.pug');
  });
  app.post('/*', function(req, res) {
    res.render('404.pug');
  });

}
