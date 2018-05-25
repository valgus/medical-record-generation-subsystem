const express = require('express');
const passport = require('passport');

const request = require('request');

const enc = require('../services/encryption');
const async = require('async');
const ObjectId = require('mongodb').ObjectID;

const config = require('../config/index');

const router = new express.Router();


router.get('/info', (req, res, next) => {
  const depId = req.query.id;
  req.app.get("db").collection('network').findOne({depId: depId}, (err, depInfo) => {
    if (err) {
      return  res.status(500).json({error: 'Error during department information finding.'});
    }
    if (!depInfo) {
      return res.status(200).json(null);
    }
    console.log(depInfo);
    request(config.blockchainUrl + "/getDepartmentInfo?id=" + depInfo.blockchainId,  (error, response, result) => {
      if (error) {
        console.log(error);
          res.status(500).json({error: 'Cannot connect to network to get department information'});
       }
       return res.status(200).json(result);
    });
  });
});

router.post('/request', (req, res, next) => {
    const requestToSend = req.body;
    req.app.get("db").collection('network').findOne({depId: requestToSend.depId}, (err, depInfo) => {
      if (err) {
        return  res.status(500).json({error: 'Error during department information finding.'});
      }
      if (!depInfo) {
        return res.status(200).json(null);
      }
      const formData = {
        fromId: depInfo.blockchainId,
        toId: requestToSend.toId
      };
      let options = {
        method: 'post',
        body: formData,
        json: true,
        url: config.blockchainUrl + "/mineRequestsBlock"
      };
      request.post(options,  (error, response, id) => {
        if (error) {
          console.log(error);
          return  res.status(500).json({error: 'Cannot connect to network to save request'});
         }
         request(config.blockchainUrl + "/getDepartmentInfo?id=" + depInfo.blockchainId,  (error, response, result) => {
           if (error) {
             console.log(error);
             return res.status(500).json({error: 'Cannot connect to network to get department information'});
            }
            console.log(result);
           return res.status(200).json(result);
         });
      });
    });
});

router.post('/confirm', (req, res, next) => {
    const requestConfirmation = req.body;
    const details = {depId: requestConfirmation.depId};
    req.app.get("db").collection('network').findOne(details, (err, depInfo) => {
      if (err) {
        return  res.status(500).json({error: 'Error during department information finding.'});
      }
      if (!depInfo) {
        return res.status(200).json(null);
      }
      const formData = {
        fromId: depInfo.blockchainId,
        toId: requestConfirmation.toId,
        giveConfirmation: requestConfirmation.accept
      };
      let options = {
        method: 'post',
        body: formData,
        json: true,
        url: config.blockchainUrl + "/mineConfirmsBlock"
      };
      async.waterfall([
            function(callback) {
              if (requestConfirmation.accept) {
                if (!depInfo.availableElements) {
                  depInfo.availableElements = [];
                }
                depInfo.availableElements.push({id: requestConfirmation.toId, elements: requestConfirmation.elements});
                req.app.get("db").collection('network').update(details, depInfo, {upsert: true}, (err, result) => {
                  if (err || !result) {
                      console.log(err);
                      callback({error: 'Error during element creation.'});
                  }
                  callback(null);
                });
              } else {
                depInfo.availableElements = depInfo.availableElements.filter(ae => ae.id !== requestConfirmation.toId);
                req.app.get("db").collection('network').update(details, depInfo, {upsert: true}, (err, result) => {
                  if (err || !result) {
                      console.log(err);
                      callback({error: 'Error during element creation.'});
                  }
                  callback(null);
                });
              }
            },
            function(callback) {
              request.post(options,  (error, response, id) => {
                if (error) {
                  console.log(error);
                  callback({error: 'Cannot connect to network to save confirmation answer.'});
                 }
                 request(config.blockchainUrl + "/getDepartmentInfo?id=" + depInfo.blockchainId,  (error, response, result) => {
                   if (error) {
                     console.log(error);
                     callback({error: 'Cannot connect to network to get department information'});
                    }
                    callback(null, result);
                 });
              });
            }
        ], function (err, result) {
            if (err) {
              console.log(err);
              return res.status(500).json(err);
            }
            return res.status(200).json(result);
        });
      });
});

router.post('/add', (req, res, next) => {
    const department = req.body;

    //adding to the blockchain
    const formData = {
      name: config.organizationName.concat(". ").concat(department.name),
      endpoint: config.dataRetrievingEndpoint
    };
    let options = {
      method: 'post',
      body: formData,
      json: true,
      url: config.blockchainUrl + "/mineInfoBlock"
    }
    async.waterfall([
          function(callback) {
            request.post(options,  (error, response, id) => {
              if (error) {
                console.log(error);
                  callback({error: 'Cannot connect to network to save department'});
               }
               console.log(id);
                callback(null, id);
            });
          },
          function(id, callback) {
            const details = { depId: department.id, blockchainId: id };
            return req.app.get("db").collection('network').insert(details, (err, result) => {
              if (err || !result) {
                  console.log(err);
                  callback({error: 'Error during department in blockchain creation.'});
              }
              callback(null, id);
            });
          },
          function(id, callback) {
            request(config.blockchainUrl + "/getDepartmentInfo?id=" + id,  (error, response, result) => {
              if (error) {
                console.log(error);
                  callback({error: 'Cannot connect to network to get department information'});
               }
               console.log(result);
              callback(null, result);
            });
          }
      ], function (err, result) {
          if (err) {
            console.log(err);
            return res.status(500).json(err);
          }
          return res.status(200).json(result);
      });
});


module.exports = router;
