var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');

var url = 'mongodb://localhost:27017/shopping';


/* GET Test page. */

router.get('/insert', function(req, res, next) {
     res.render('product/insert', {title: 'Add Product'});
});
router.get('/update', function(req, res, next) {
     res.render('product/update', {title: 'update Product'});
});
router.get('/delete', function(req, res, next) {
     res.render('product/delete', {title: 'delete Product'});
});

router.post('/insert', function(req, res, next) {
    
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
  
res.redirect('/product/insert');
 
});

router.post('/update', function(req, res, next) {
    
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

router.post('/delete', function(req, res, next) {
    
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

router.get('/get-data', function(req, res, next){
  var resultArray = [];
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    var cursor = db.collection('products').find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function(){
      db.close();
      res.render('product/insert', {items: resultArray});
    });
  });
});


module.exports = router;
