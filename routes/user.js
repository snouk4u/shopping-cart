var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');

var Order = require('../models/order');
var User = require('../models/user');
var Cart = require('../models/cart');

var url = 'mongodb://snoukok:pppppppp@ds139082.mlab.com:39082/hankaikong';
//var url = 'mongodb://localhost:27017/shopping';

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

        res.render('user/profile', {title: 'ໃບສັ່ງຊື້ທັງໝົດ', orders: orders });
    });
});

router.get('/dashboard', isLoggedIn, function(req, res, next) {
    Order.find({user: req.user}, function(err, orders) { if (err) { return res.write('Error!');  }
        
        res.render('user/dashboard', {title: 'ຈັດການສິນຄ້າ',csrfToken: req.csrfToken()});
    });
});



/* GET Test page. */
router.get('/insert', isLoggedIn, function(req, res, next) {
     res.render('user/get-data', {title: 'ເພີ່ມສິນຄ້າ', csrfToken: req.csrfToken()});
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
      res.render('user/order', {title: 'ໃບສັ່ງຊື້ທັງໝົດ', items: resultArray});
    });
  });
});

router.get('/order', isLoggedIn, function(req, res, next){
  var successMsg = req.flash('success')[0];
  Order.find(function(err, docs) {
    var orderChunks = [];
    var chunkSize = 3;
    for (var i = 0; i< docs.length; i += chunkSize) {
      orderChunks.push(docs.slice(i, i + chunkSize));
    }
  
    res.render('user/order', { title: 'ໃບສັ່ງຊື້ທັງໝົດ', orders: orderChunks});
  });
  
});

router.get('/user', isLoggedIn, function(req, res, next){
  var successMsg = req.flash('success')[0];
  User.find(function(err, docs) {
    var userChunks = [];
    var chunkSize = 3;
    for (var i = 0; i< docs.length; i += chunkSize) {
      userChunks.push(docs.slice(i, i + chunkSize));
    }
  
    res.render('user/user', { users: userChunks, successMsg: successMsg, noMessage: !successMsg });
  });
  
});

router.get('/update', isLoggedIn, function(req, res, next) {
     res.render('user/dashboard', {title: 'updated Product', csrfToken: req.csrfToken()});
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
      res.render('user/dashboard', {title: 'ແກ້ໄຂຂໍ່ມູນສິນຄ້າໃໝ່ແລ້ວ', csrfToken: req.csrfToken()});
    });
  }); 
});

router.get('/delete', isLoggedIn, function(req, res, next) {
     res.render('user/dashboard', {title: 'Delete Product', csrfToken: req.csrfToken()});
});

router.post('/delete', isLoggedIn, function(req, res, next) {
    
  var id = req.body.id;

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('products').deleteOne({"_id": objectId(id)}, function(err, result) {
      assert.equal(null, err);
      console.log('Item deleted');
      db.close();
      res.render('user/dashboard', {title: 'ການລົບສິນຄ້າສຳເລັດ', csrfToken: req.csrfToken()});
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
      res.render('user/dashboard', {title: 'ສິນຄ້າທັງໝົດ', items: resultArray, csrfToken: req.csrfToken()});
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