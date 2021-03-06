const mongoose = require('mongoose');
const Event = require('../models/event');
const User = require('../models/user');
const Reservation = require('../models/reservation')

function getAllEvents(req, res) {
  Event.find({}, (err, events) => {

    if (err) {
      res.status(404).send(err)
    } else {
      res.status(200).send(events)
    }
  });
}

function getAllEventsByUser(req, res) {
  let userId = req.params.userId;
  Event.find({'created_by': userId}, (err, events) => {
    if (err) {
      res.status(404).send(err)
    } else {
      res.status(200).send(events)
    }
  });
}

function getOneEventById(req, res) {
	let eventId = req.params.id;
  Event.findById({_id: eventId}, (err, event) => {
    if (err) {
      res.status(404).send(err)
    } else {
      res.status(200).send(event)
    }
  });
}

function getOneEventByTitle(req, res) {
	let query = req.query.title;
  Event.find({'title' : new RegExp(query, 'i')}, function(err, docs){
    if (err) {
      res.status(404).send(err)
    } else {
      res.status(200).send(docs)
    }
  });
}

function createEvent(req, res) {
  let userId = req.user.id
  req.body.created_by = userId
  let newEvent = new Event(req.body)

  newEvent.save((err,event) => {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).send({ message: 'Created!', event })
    }
  });
}

function updateEvent(req, res) {
  const eventId = req.params.id

  Event.findById({_id: eventId}, (err, event) => {
        if(err) {
          res.status(404).send(err);
        } else {
          Object.assign(event, req.body).save((err, event) => {
              if(err) res.send(err);
              res.json({ message: 'Updated!', event });
          });
        }
    });
}

function rsvpToEvent(req, res) {
  const eventId = req.params.id;
  const userId = req.user.id
  let newRegistration = new Reservation()
  newRegistration.user_id = userId
  newRegistration.event_id = eventId

  newRegistration.save((err, registration)=> {
    if (err) {
      res.status(400).send(err)
    }else{
      res.status(200).send({message: "RSVP succeed!"})
    }
  })
}

function deleteEvent(req,res) {
  const eventId = req.params.id

  Event.remove({_id: eventId}, (err) => {
    if (err) {
      res.status(404).send(err)
    } else {
      res.json({message: 'Deleted'})
    }
  });
}

function checkAuthorized(req, res, next) {
  let userId = req.user.id
  let eventId = req.params.id

  Event.findOne({_id: eventId}, (err, event)=> {
    if (err) res.status(400)
    if (typeof event == 'undefined') {
      res.status(400).send("Not found")
    }else if (event.created_by == userId) {
      next()
    }else{
      res.status(401).send("Unauthorized")
    }
  });
}

module.exports = { getAllEvents, getAllEventsByUser, getOneEventById, getOneEventByTitle,
  createEvent, updateEvent, rsvpToEvent, deleteEvent, checkAuthorized }
