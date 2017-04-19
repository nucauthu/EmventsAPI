const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const EventRoute = require('./routes/event')
const config = require('config')
const passport = require('passport')
const Strategy = require('passport-http').BasicStrategy
const User = require('./models/user')

// Connection URL
const url = config.DBHost;

// Connectect to DB
mongoose.connect(url)
let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))

// Middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(passport.initialize());
app.use(passport.session());

// Set up passport serialization
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Setup passport
passport.use(new Strategy(
  function(username, password, cb) {
    User.findOne({username: username}, (err, user) => {
      if (err) {
        return cb(err);
      }

      if (!user) {
        return cb(null, false);
      }

      if (user.password != password) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  }));

// Routes
app.get('/events', function(req, res, next) {
  passport.authenticate('basic', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(400).send({message: 'Wrong username or password'}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return EventRoute.getAllEvents(req, res);
    });
  })(req, res, next);
});

app.get('/events/search', function(req, res, next) {
  passport.authenticate('basic', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(400).send({message: 'Wrong username or password'}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return EventRoute.getOneEventByTitle(req, res);
    });
  })(req, res, next);
});

app.get('/events/:id', function(req, res, next) {
  passport.authenticate('basic', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(400).send({message: 'Wrong username or password'}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return EventRoute.getOneEventById(req, res);
    });
  })(req, res, next);
});

app.post('/events', function(req, res, next) {
  passport.authenticate('basic', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(400).send({message: 'Wrong username or password'}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return EventRoute.createEvent(req, res);
    });
  })(req, res, next);
});

app.put('/events/:id', function(req, res, next) {
  passport.authenticate('basic', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(400).send({message: 'Wrong username or password'}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return EventRoute.updateEvent(req, res);
    });
  })(req, res, next);
});

app.delete("/events/:id", function(req, res, next) {
  passport.authenticate('basic', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(400).send({message: 'Wrong username or password'}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return EventRoute.deleteEvent(req, res);
    });
  })(req, res, next);
});

app.listen(3010, () => {
  console.log('Example app listening on port 3010!')
});

module.exports = app
