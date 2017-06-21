var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');

var Order = require('../models/order');
var Cart = require('../models/cart');

var url = 'mongodb://localhost:27017/shopping';

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next) {
    Order.find({user: req.user}, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', { orders: orders });
    });
});

router.get('/dashboard', isLoggedIn, function(req, res, next) {
    Order.find({user: req.user}, function(err, orders) { if (err) { return res.write('Error!');  }
        
        res.render('user/dashboard', {title: 'Dashboard',csrfToken: req.csrfToken()});
    });
});

/* GET Test page. */
router.get('/insert', isLoggedIn, function(req, res, next) {
     res.render('user/dashboard', {title: 'Add Product', csrfToken: req.csrfToken()});
});

router.post('/insert', isLoggedIn, function(req, res, next) {
    
  var item = {
    imagePath: req.body.imagePath,
    title: req.body.title,
    description: req.body.description,
    price: req.body.price
  };

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('products').insertOne(item, function(err, result) {
      assert.equal(null, err);
      console.log('Item inserted');
      db.close();
    });
  });
  
res.redirect('/user/dashboard');
 
});

router.get('/get-order', isLoggedIn, function(req, res, next){
  var resultArray = [];
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    var cursor = db.collection('orders').find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function(){
      db.close();
      res.render('user/dashboard', {items: resultArray});
    });
  });
});

router.get('/update', isLoggedIn, function(req, res, next) {
     res.render('user/update', {title: 'Update Product', csrfToken: req.csrfToken()});
});

router.post('/update', isLoggedIn, function(req, res, next) {
    
  var item = {
    imagePath: req.body.imagePath,
    title: req.body.title,
    description: req.body.description,
    price: req.body.price
  };

  var id = req.body.id;

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('products').updateOne({"_id": objectId(id)}, {$set: item}, function(err, result) {
      assert.equal(null, err);
      console.log('Item updated');
      db.close();
    });
  }); 
});

router.get('/delete', isLoggedIn, function(req, res, next) {
     res.render('user/delete', {title: 'Delete Product', csrfToken: req.csrfToken()});
});

router.post('/delete', isLoggedIn, function(req, res, next) {
    
  var id = req.body.id;

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('products').deleteOne({"_id": objectId(id)}, function(err, result) {
      assert.equal(null, err);
      console.log('Item deleted');
      db.close();
    });
  }); 
});

router.get('/get-data', isLoggedIn, function(req, res, next){
  var resultArray = [];
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    var cursor = db.collection('products').find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function(){
      db.close();
      res.render('user/dashboard', {items: resultArray, csrfToken: req.csrfToken()});
    });
  });
});

/* End Test page. */

router.get('/logout', isLoggedIn, function(req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res, next) {
    next();
    
});

router.get('/signup', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signup', {title: 'ສະໝັກເປັນສຳມະຊິກ',csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length >0 });
});

router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/user/signup',
  failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

router.get('/signin', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signin', {title: 'ລົງຊື່ເຂົ້າລະບົບ',csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length >0 });
});

router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/user/signin',
  failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/dashboard');
    }
});


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}