var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping');

var products = [
    new Product({
    imagePath: 'http://localhost/images/24.jpg',
    title: 'ໝາກຄັນຕະລົດ',
    description: 'ແຊບ, ຫວານ',
    price: 15
}),
    new Product({
    imagePath: 'http://localhost/images/25.jpg',
    title: 'ໝາກຜີພ່ວນ',
    description: 'ແຊບ, ຫວານ',
    price: 8
}),
    new Product({
    imagePath: 'http://localhost/images/26.jpg',
    title: 'ໝາກມ່ວງ',
    description: 'ແຊບ, ຫວານ',
    price: 10
}),
];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function(err, result){
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}

