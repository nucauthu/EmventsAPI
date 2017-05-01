const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
var acl = require('acl')
const EventRoute = require('./routes/event');
const UserRoute = require('./routes/users');
const config = require('config')
const passport = require('passport')
const Strategy = require('passport-http').BasicStrategy
const User = require('./models/user')

// Connection URL
let port = process.env.PORT || 3000
const url = process.env.MONGODB_URI || config.DBHost;

// Connectect to DB
mongoose.connect(url)
let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))

db.on('connected', function(error){
    if (error) throw error;
    //you must set up the db when mongoose is connected or your will not be able to write any document into it
    acl = new acl(new acl.mongodbBackend(mongoose.connection.db, 'acl_'));
});

// Middleware
app.use(bodyParser.json()); // for parsing application/json

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
app.get('/events',
passport.authenticate('basic', { session: false }),
EventRoute.getAllEvents);

app.get('/users/:userId/events',
passport.authenticate('basic', { session: false }),
EventRoute.getAllEventsByUser);

app.get('/events/search',
passport.authenticate('basic', { session: false }),
EventRoute.getOneEventByTitle);

app.get('/events/:id',
passport.authenticate('basic', { session: false }),
EventRoute.getOneEventById);

app.get('/events/:id/reservations',
passport.authenticate('basic', { session: false }),
EventRoute.checkAuthorized,
UserRoute.getEventReservationsId);

app.post('/events',
passport.authenticate('basic', { session: false }),
EventRoute.createEvent);

app.put('/events/:id',
passport.authenticate('basic', { session: false }),
EventRoute.checkAuthorized,
EventRoute.updateEvent);

app.post('/events/:id/rsvp',
passport.authenticate('basic', { session: false }),
EventRoute.rsvpToEvent);

app.delete("/events/:id",
passport.authenticate('basic', { session: false }),
EventRoute.checkAuthorized,
EventRoute.deleteEvent);

// User routes

//returns all the upcoming events a user has signed up for
app.get('/users/:userId/rsvp',
passport.authenticate('basic', { session: false }),
UserRoute.getAllEventsRegistedByUser);

//return all users
app.get('/users/events',
passport.authenticate('basic', { session: false }),
UserRoute.getAllUsers);

app.listen(port, () => {
  console.log('Example app listening on port' + port  +'!')
});

module.exports = app
