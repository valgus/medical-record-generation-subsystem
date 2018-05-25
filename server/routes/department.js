const express = require('express');
const passport = require('passport');

const enc = require('../services/encryption');
const async = require('async');
const ObjectId = require('mongodb').ObjectID;

const router = new express.Router();


router.get('/all', (req, res, next) => {
  req.app.get("db").collection('departments').find().toArray((err, departments) => {
    if (err) {
      return  res.status(500).json({error: 'Error during departments finding.'});
    }
    return res.status(200).json(departments);
  });
});

router.get('/userAll', (req, res, next) => {
  const id = req.query.id;
  const level = req.query.level;
  let details = {headId: id};
  console.log(details, level);
  if (parseInt(level) === 1) {
    req.app.get("db").collection("users").findOne({members :  new ObjectId(id)}, (err, user) => {
      if (err) {
        return  res.status(500).json({error: 'Error during departments finding.'});
      }
      details = {headId: user._id.toString()};
      console.log(details);
      req.app.get("db").collection('departments').find(details).toArray((err, departments) => {
        if (err) {
          return  res.status(500).json({error: 'Error during departments finding.'});
        }
        console.log(departments);
        return res.status(200).json(departments);
      });
    });
  } else {
    req.app.get("db").collection('departments').find(details).toArray((err, departments) => {
      if (err) {
        return  res.status(500).json({error: 'Error during departments finding.'});
      }
      console.log(departments);
      return res.status(200).json(departments);
    });
  }
});


router.post('/save', (req, res, next) => {
    const department = req.body;
    console.log(department);
    let details = { 'name':department.name, 'headId': department.id };
    return req.app.get("db").collection('departments').insert(details, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during department creation.'});
      }
      req.app.get("db").collection('departments').find().toArray((err2, departments) => {
        if (err2) {
          return  res.status(500).json({error: 'Error during departments finding.'});
        }
        return res.status(200).json(departments);
      });
    });
});

router.get('/findMedrecs', (req, res, next) => {
  const id = req.query.id;
  const details = {depId: id}
  req.app.get("patientdb").collection('medrecs').find(details, {fields:{ _id: 1, number: 1 }}).toArray((err, medrecs) => {
    if (err) {
      return  res.status(500).json({error: 'Error during medical records finding.'});
    }
    return res.status(200).json(medrecs);
  });
});


router.post('/delete', (req, res, next) => {
    const department = req.body;
    console.log(department);
    let details = {  '_id':new ObjectId(department.id)  };
    return req.app.get("db").collection('departments').remove(details, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during department remove.'});
      }
      req.app.get("db").collection('departments').find().toArray((err2, departments) => {
        if (err2) {
          return  res.status(500).json({error: 'Error during departments finding.'});
        }
        return res.status(200).json(departments);
      });
    });
});

router.post('/hardDelete', (req, res, next) => {
    const department = req.body;
    const mrIds = [];
    for (const medrecId of department.medRecIds) {
      mrIds.push(new ObjectId(medrecId._id));
    }
    let details = {  'mrId':  { $in: mrIds }  };
    console.log(mrIds);
    req.app.get("patientdb").collection('mrelements').find(details, {fields:{ _id: 1 }}).toArray((err, mrelements) => {
      if (err) {
        return  res.status(500).json({error: 'Error during department deletion.'});
      }
      console.log(mrelements);
      const elementsIds = [];
      for (const element of mrelements) {
        elementsIds.push(new ObjectId(element._id));
      }
      req.app.get("patientdb").collection('documents').remove(details, (err, result) => {
        details = {  '_id':  { $in: elementsIds }  };
        req.app.get("patientdb").collection('observedvalues').remove(details, (err, result) => {
          req.app.get("patientdb").collection('templates').remove(details, (err, result) => {
            req.app.get("patientdb").collection('questionnaires').remove(details, (err, result) => {
              req.app.get("patientdb").collection('mrelements').remove(details, (err, result) => {
                details = {  '_id':  { $in: mrIds }  };
                req.app.get("patientdb").collection('medrecs').remove(details, (err, result) => {
                  details = {  '_id':new ObjectId(department.id)  };
                  return req.app.get("db").collection('departments').remove(details, (err, result) => {
                    if (err || !result) {
                        console.log(err);
                        return  res.status(500).json({error: 'Error during department remove.'});
                    }
                    req.app.get("db").collection('departments').find().toArray((err2, departments) => {
                      if (err2) {
                        return  res.status(500).json({error: 'Error during departments finding.'});
                      }
                      return res.status(200).json(departments);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
});

router.post('/setName', (req, res, next) => {
    const department = req.body;
    let details = {  '_id':new ObjectId(department.id)  };
    delete department.id;
    return req.app.get("db").collection('departments').update(details, { $set: department},  (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during department name updating.'});
      }
        return res.status(200).json("ok");
      });
});



module.exports = router;
