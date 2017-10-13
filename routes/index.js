var models = require("../models/index.js");
var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var flash = require('connect-flash');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({
  extended: true
});


module.exports = function(passport, models) {


  /* GET home page. */
  router.get('/', urlencodedParser, function(req, res, next) {
    res.json({Something: 'Awesome', About: 'to happen'});
  });

  var User = models.user;
  var Fooditem = models.fooditem;
  var Order = models.order;

  router.post('/signup', passport.authenticate('local-signup', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.json({success: false}); }

    // req / res held in closure
    req.logIn(user, function(err) {
      if (err) { return res.status(err.statusCode || 500).json(err); }
      return res.json(user);
    });
  })
);

  router.use(flash());

  router.post('/login', function(req, res, next) {
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


  //+++++++++   CHECK LOGIN     +++++++++++
  function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())

      return next();

    res.redirect('/login');

  }

  router.post('/addfooditem', urlencodedParser, function(req, res) {
    var newfooditem = new Fooditem();
    newfooditem.name = req.body.name;
    newfooditem.price = req.body.price;
    newfooditem.description = req.body.description;
    newfooditem.nutrition = req.body.nutrition;
    newfooditem.tags = req.body.tags;
    newfooditem.save(function(err) {
      if (err) res.status(err.statusCode || 500).json(err);
      res.json({message:"succeeded!"});
    });
  });

  router.post('/search', function(req, res) {
    var fooditem = new Fooditem();
    var searchString = req.body.fooditem;
    console.log("here on sear");
    fooditem.find({$text: {$search: searchString}})
       .skip(20)
       .limit(10)
       .exec(function(err, docs) {
         if (err) res.status(err.status || 500).json(err)
         console.log(JSON.stringify(docs) + "***");
         res.json({docs, searchString});
     });
  });




  //get menu
  router.get('/order', function(req, res, next) {
    var newOrder = new Order();
    newOder.name = req.body.name;
    newOrder.price = req.body.price;
    newOrder.orderby= req.body.orderby;
    newOrder.phone = req.body.phone;
    newOrder.location = req.body.location;
    newOrder.fooditems = [{ fooditem: req.body.instructions, instruction : req.body.instructions }];
    newOrder.tags = req.body.deliverytime;
    newOrder.save(function(err) {
      if (err) res.status(err.statusCode || 500).json(err);
      res.json({message:"succeeded!"});
    });
  });

  router.get('/editorder', function(req, res, next){
    var Order = new Order();
    Order.findById(req.body.id, function(err, order){
      res.json(order);
    });
  });
  router.post('/editorder', function(req, res, next) {
    var newOrder = new Order();
    newOrder.findById(req.body.id, function(err, order){
      if (err) res.status(err.statusCode || 500).json(err);
      oder.name = req.body.name;
      order.price = req.body.price;
      order.orderby= req.body.orderby;
      order.phone = req.body.phone;
      order.location = req.body.location;
      order.fooditems = [{ fooditem: req.body.instructions, instruction : req.body.instructions }];
      order.tags = req.body.deliverytime;
      order.save(function(err) {
        if (err) res.status(err.statusCode || 500).json(err);
        res.json({message:"succeeded!"});
      });
    })

  });

  router.get('/cancelorder', function(req, res, next) {
    var newOrder = new Order();
    newOder.findById(req.body.id, function(err, order){
      oder.revoked = req.body.revoke;
      order.save(function(err) {
        if (err) res.status(err.statusCode || 500).json(err);
        res.json({message:"succeeded!"});
      });
    })

  });
  //+++++++     LOG OUT     +++++++++++
  router.get('/logout',  function(req, res) {
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
  router.post('/upload', isLoggedIn, function(req, res) {
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


  router.get('/*', function(req, res) {
    res.status(err.status || 404).json({message: 'notfound'});
  });

  router.post('/*', function(req, res) {
    res.send(err.status || 404).json({message: 'notfound'});
  });

  return router;
}
