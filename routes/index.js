var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');



var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function(err, docs) {
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i< docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.render('shop/index', { title: 'ຮ້ານຂາຍຂອງ', products: productChunks, successMsg: successMsg, noMessage: !successMsg });
  });
});


router.get('/add-to-cart/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function(err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});

router.get('/reduce/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
  if(!req.session.cart) {
    return res.render('shop/shopping-cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {title: 'ກະຕ່າ' ,products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', function(req, res, next) {
  if(!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {title: 'ສັ່ງຊື້' ,total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart); 


  var order = new Order({
    user: req.user,
    cart: cart,
    address: req.body.address,
    name: req.body.name
    
  });
  order.save(function(err, result){
      req.flash('success', ' ທ່ານໄດ້ສັ່ງຊື້ສິນຄ້າແລ້ວ! ກະລຸນາລໍຖ້າສິນຄ້າຈະສົ່ງເຖິງທ່ານ ໃນບໍ່ເກີນ3ວັນ. ຂອບໃຈຫຼາຍໆ');
      req.session.cart = null;
      res.redirect('/');
  
});
});
router.get('/profile', function(req, res, next) {
    Order.find(function(err, orders) {
        
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('shop/profile', { orders: orders });
    });
});

router.get('/signin', function(req, res, next) {
  res.render('user/signin', {title: 'ລົງຊື່ເຂົ້າລະບົບ'});
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}
