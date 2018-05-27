var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
var Book = require("../models/book");

require('../config/passport')(passport);

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('Express RESTful API');
});

// route signup :

router.post('/signup', (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.json({
      success: false,
      msg: 'Please pass username and password.'
    });
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password
    });

    // save the user
    newUser.save(function (err) {
      if (err) {
        return res.json({
          success: false,
          msg: 'Username already exists.'
        });
      }
      res.json({
        success: true,
        msg: 'Successfull created new user'
      });
    });
  }
});

// SigIN
router.post('/signin', (req, res) => {
  User.findOne({
    username: req.body.username
  }, function (err, user) {
    if (!user) {
      res.status(401).send({
        success: false,
        msg: 'Authentification failed. User Not found'
      });
    } else {
      // Check If password match :
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          var token = jwt.sign(user.toJson(), config.secret);
          res.json({
            success: true,
            token: 'JWT' + token
          });
        } else {
          res.status(401).send({
            success: false,
            msg: 'Authentification failed. Wrong password'
          });
        }
      })

    }
  })
});


// Add a book for authorized user
router.post('/book', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  var token = getToken(req.headers);
  if (token) {
    console.log(req.body);
    var newBook = new Book({
      isbn: req.body.isbn,
      title: req.body.title,
      author: req.body.author,
      publisher: req.body.publisher
    });

    newBook.save(function (err) {
      if (err) {
        return res.json({
          success: false,
          msg: 'Save book failed'
        });

        res.json({
          success: true,
          msg: 'New Book created'
        });
      } else {

        return res.status(403).send({
          success: false,
          msg: 'Unauthorized.'
        });

      }
    })
  }
});

// getting list of books that accessible for authorized user.

router.get('/book', passport.authenticate('jwt', {
  session: false
}), function (req, res) {
  var token = getToken(req.headers);
  if (token) {
    Book.find(function (err, books) {
      if (err) return next(err);
      res.json(books);
    });
  } else {
    return res.status(403).send({
      success: false,
      msg: 'Unauthorized.'
    });
  }
});

// function for parse authorization token from request headers.

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};


module.exports = router;
