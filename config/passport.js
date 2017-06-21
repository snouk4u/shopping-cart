var passport = require('passport');
var User = require('../models/user');
var Product = require('../models/product');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.serializeProduct(function(product, done) {
    done(null, product.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.deserializeProduct(function(id, done) {
    Product.findById(id, function(err, product) {
        done(err, product);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'Email is already in use.'});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.save(function(err, result) {
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        })
    });
}));
// Start Product

passport.use('local.insert', new LocalStrategy({
    imagePathField: 'imagePath',
    Fieldtitle: 'title',
    Fielddescription: 'description',
    Fieldprice: 'price',
    passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('imagePath', 'Invalid imagePath').notEmpty().isImagePath();
    req.checkBody('title', 'Invalid title').notEmpty().isTitle();
    req.checkBody('description', 'Invalid description').notEmpty().isDescription();
    req.checkBody('price', 'Invalid price').notEmpty().isPrice();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    Product.findOne({'title': title}, function(err, product) {
        if (err) {
            return done(err);
        }
        if (product) {
            return done(null, false, {message: 'Title is already in use.'});
        }
        var newProduct = new Product();
        newProduct.imagePath = imagePath;
        newProduct.title = title;
        newProduct.description = description;
        newProduct.price = price;
        
        newProduct.save(function(err, result) {
            if (err) {
                return done(err);
            }
            return done(null, newProduct);
        })
    });
}));
// End Product
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'No user found.'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Wrong password.'});
        }
        return done(null, user);
    });
}));
