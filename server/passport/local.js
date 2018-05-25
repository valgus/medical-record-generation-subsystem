const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const request = require('request');

const enc = require('../services/encryption');
const config = require('../config/index');


const ObjectId = require('mongodb').ObjectID;
/**
 * Password strategy
 */


 module.exports = new LocalStrategy({
   usernameField: 'username',
   passwordField: 'password',
   session: false,
   passReqToCallback: true
 }, (req, username, password, done) => {
   const details = { 'username':username };
   const response = {username: '', id: '', level: '', headIds: []};
   req.app.get("db").collection('users').findOne(details, (err, result) => {
     console.log('got response');
         if (err) {
           console.log(err);
           return done('Error occured.');
         } else {
           if (result) {
             const pass = enc.decrypt(result.password, result.username);
              if ( pass !== password) {
                console.log("Password is wrong");
                return done('Pasword is wrong.');
              }
              response.id =result._id;
              response.username = result.username;
              response.level = result.level;
              if (result.level === 1) {
                req.app.get("db").collection('users').find({ 'members': result._id }).toArray((err, heads) => {
                    for (const head of heads) {
                      console.log(head);
                      response.headIds.push(head._id);
                    }
                    return done(null, response);
                });
              } else {
                return done(null, response);
              }
           } else {
             console.log("Not found");
            return done('Such user was not found.')
           }
         }
       });
 });
