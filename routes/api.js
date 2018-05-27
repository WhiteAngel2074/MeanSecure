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
        msg: 'Successful created new user'
      });
    });
  }
});

module.exports = router;
