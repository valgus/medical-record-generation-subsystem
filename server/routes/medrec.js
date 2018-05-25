const express = require('express');
const passport = require('passport');

const enc = require('../services/encryption');
const async = require('async');
const ObjectId = require('mongodb').ObjectID;

const router = new express.Router();


router.get('/all', (req, res, next) => {
  const id = req.query.id;
  let details = {depId: id}
  req.app.get("db").collection('mrelements').find(details).toArray((err, elements) => {
    if (err) {
      return  res.status(500).json({error: 'Error during medical record elements finding.'});
    }
    elements.sort(typeComparator);
    details = {  '_id':new ObjectId(id)  };
    req.app.get("db").collection('departments').findOne(details, {fields:{ _id: 0, headId: 1,  name: 1 }}, (err2, result) => {
      if (err2) {
        return  res.status(500).json({error: 'Error during department name finding.'});
      }
      return res.status(200).json({ elements, name: result.name, headId: result.headId });
    });
  });
});

router.post('/save', (req, res, next) => {
    const element = req.body;
    console.log(element);
    let details = { 'name':element.name, 'type': element.type, 'depId': element.id };
    return req.app.get("db").collection('mrelements').insert(details, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during element creation.'});
      }
      details = {depId: element.id};
      req.app.get("db").collection('mrelements').find(details).toArray((err2, elements) => {
        if (err2) {
          return  res.status(500).json({error: 'Error during medical record elements finding.'});
        }
        elements.sort(typeComparator);
        return res.status(200).json(elements);
      });
    });
});


router.post('/delete', (req, res, next) => {
    const element = req.body;
    console.log(element);
    let details = {  '_id':new ObjectId(element.id)  };
    return req.app.get("db").collection('mrelements').remove(details, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during element remove.'});
      }
      details = {depId: element.depId};
      req.app.get("db").collection('mrelements').find(details).toArray((err2, elements) => {
        if (err2) {
          return  res.status(500).json({error: 'Error during medical record elements finding.'});
        }
        elements.sort(typeComparator);
        return res.status(200).json(elements);
      });
    });
});


router.post('/setName', (req, res, next) => {
    const department = req.body;
    let details = {  '_id':new ObjectId(department.id)  };
    delete department.id;
    return req.app.get("db").collection('mrelements').update(details, { $set: department},  (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during element name updating.'});
      }
        return res.status(200).json("ok");
      });
});

router.get('/infoElements', (req, res, next) => {
  const id = req.query.id;
  const details = {depId: id,  type: { $in: [0,2] }}
  console.log(details);
  req.app.get("db").collection('mrelements').find(details, {fields:{"name": 1, "type": 1}}).toArray((err, elements) => {
    if (err) {
      return  res.status(500).json({error: 'Error during medical record elements finding.'});
    }
    elements.sort(typeComparator);
    for (const element of elements) {
      element.isChecked = false;
    }
    return res.status(200).json(elements);
  });
});

router.post('/saveFolder', (req, res, next) => {
    const folder = req.body;
    console.log(folder);
    const details = {  '_id':new ObjectId(folder._id)  };
    delete folder._id;
    return req.app.get("db").collection('folders').update(details, folder, {upsert: true}, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during element creation.'});
      }
      return res.status(200).json({result: "ok"});
    });
});

router.post('/cloneFolder', (req, res, next) => {
    const folder = req.body;
    console.log(folder);
    let details = { 'name':folder.name, 'type': 3, 'depId': folder._id };
    delete folder._id;
    delete folder.name;
    return req.app.get("db").collection('mrelements').insert(details, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during element creation.'});
      }
      console.log(result.ops[0]);
      details = {  '_id':new ObjectId(result.ops[0]._id)  };
      return req.app.get("db").collection('folders').update(details, folder, {upsert: true}, (err, result) => {
        if (err || !result) {
            console.log(err);
            return  res.status(500).json({error: 'Error during element creation.'});
        }
        return res.status(200).json({result: "ok"});
      });
    });
});

router.get('/getFolder', (req, res, next) => {
  const id = req.query.id;
  console.log(id);
  const details = {  '_id':new ObjectId(id)  };
  console.log('deta', details);
  return req.app.get("db").collection('folders').findOne(details, (err, result) => {
    if (err) {
        console.log(err);
        return  res.status(500).json({error: 'Error during folder extraction.'});
    }
    if (!result) {
      result = {};
    }
    req.app.get("db").collection("mrelements").findOne(details, (err, result2) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during folder name extraction.'});
      }
      result.name = result2.name;
      console.log(err, result);
      return res.status(200).json({ folder: result });
    });
  });
});

router.post('/saveObValue', (req, res, next) => {
    const obValue = req.body;
    console.log(obValue);
    const details = {  '_id':new ObjectId(obValue._id)  };
    delete obValue._id;
    return req.app.get("db").collection('observedvalues').update(details, obValue, {upsert: true}, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during observed value creation.'});
      }
      return res.status(200).json({result: "ok"});
    });
});

router.post('/cloneObValue', (req, res, next) => {
    const obValue = req.body;
    console.log(obValue);
    let details = { 'name':obValue.name, 'type': 2, 'depId': obValue._id };
    delete obValue._id;
    delete obValue.name;
    return req.app.get("db").collection('mrelements').insert(details, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during element creation.'});
      }
      console.log(result.ops[0]);
      details = {  '_id':new ObjectId(result.ops[0]._id)  };
      return req.app.get("db").collection('observedvalues').update(details, obValue, {upsert: true}, (err, result) => {
        if (err || !result) {
            console.log(err);
            return  res.status(500).json({error: 'Error during observed value creation.'});
        }
        return res.status(200).json({result: "ok"});
      });
    });
});


router.get('/getObValue', (req, res, next) => {
  const id = req.query.id;
  console.log(id);
  const details = {  '_id':new ObjectId(id)  };
  console.log('deta', details);
  return req.app.get("db").collection('observedvalues').findOne(details, (err, result) => {
    if (err) {
        console.log(err);
        return  res.status(500).json({error: 'Error during observed value extraction.'});
    }
    if (!result) {
      result = {};
    }
    req.app.get("db").collection("mrelements").findOne(details, (err, result2) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during observed value name extraction.'});
      }
      result.name = result2.name;
      console.log(err, result);
      return res.status(200).json({ ov: result });
    });
  });
});

router.post('/saveQuestionnaire', (req, res, next) => {
    const questions = req.body;
    const details = {  '_id':new ObjectId(questions._id)  };
    delete questions._id;
    return req.app.get("db").collection('questionnaires').update(details, questions, {upsert: true}, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during questionnaire creation.'});
      }
      return res.status(200).json({result: "ok"});
    });
});


router.post('/cloneQuestionnaire', (req, res, next) => {
    const questionnaire = req.body;
    console.log(questionnaire);
    let details = { 'name':questionnaire.name, 'type': 0, 'depId': questionnaire._id };
    delete questionnaire._id;
    delete questionnaire.name;
    return req.app.get("db").collection('mrelements').insert(details, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during element creation.'});
      }
      console.log(result.ops[0]);
      for (const question of questionnaire.questions) {
        const newId = randomStr();
        const linkedQuestions = questionnaire.questions.filter(q => q.linkIndex === question.id);
        linkedQuestions.map(q => q.linkIndex = newId);
        question.id = newId;
      }
      details = {  '_id':new ObjectId(result.ops[0]._id)  };
      return req.app.get("db").collection('questionnaires').update(details, questionnaire, {upsert: true}, (err, result) => {
        if (err || !result) {
            console.log(err);
            return  res.status(500).json({error: 'Error during questionnaire creation.'});
        }
        return res.status(200).json({result: "ok"});
      });
    });
});

router.get('/getQuestionnaire', (req, res, next) => {
  const id = req.query.id;
  const details = {  '_id':new ObjectId(id)  };
  return req.app.get("db").collection('questionnaires').findOne(details, (err, result) => {
    if (err) {
        console.log(err);
        return  res.status(500).json({error: 'Error during questionnaire extraction.'});
    }
    if (!result) {
      result = {};
    }
    req.app.get("db").collection("mrelements").findOne(details, (err, result2) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during observed value name extraction.'});
      }
      result.name = result2.name;
      console.log(err, result);
      return res.status(200).json({ q: result });
    });
  });
});

router.post('/saveTemplate', (req, res, next) => {
    const parts = req.body;
    const details = {  '_id':new ObjectId(parts._id)  };
    delete parts._id;
    return req.app.get("db").collection('templates').update(details, parts, {upsert: true}, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during template creation.'});
      }
      return res.status(200).json({result: "ok"});
    });
});

router.post('/cloneTemplate', (req, res, next) => {
    const template = req.body;
    console.log(template);
    let details = { 'name':template.name, 'type': 1, 'depId': template._id };
    delete template.name;
    delete template._id;
    return req.app.get("db").collection('mrelements').insert(details, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during element creation.'});
      }
      for (const part of template.parts) {
        part.html = part.html.replace(/--\$\w+--/g,'');
        part.delta = part.delta.replace(/--\$\w+--/g,'');
        part.notes = part.notes.replace("Inserted items:\n", "");
        part.notes = part.notes.replace(/--\$\w+--.*\n/g, '');
        part.linkedQuestions = [];
      }
      template._id = new ObjectId(result.ops[0]._id);
      return req.app.get("db").collection('templates').insertOne(template, (err, result) => {
        if (err || !result) {
            console.log(err);
            return  res.status(500).json({error: 'Error during template creation.'});
        }
        return res.status(200).json({result: "ok"});
      });
    });
});


router.get('/getTemplate', (req, res, next) => {
  const id = req.query.id;
  let details = {  '_id':new ObjectId(id)  };
  return req.app.get("db").collection('templates').findOne(details, (err, result) => {
    if (err) {
        console.log(err);
        return  res.status(500).json({error: 'Error during template extraction.'});
    }
    if (!result) {
      result = { parts:[]};
    }
    req.app.get("db").collection("mrelements").findOne(details, (err, result2) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during template information extraction.'});
      }
      result.name = result2.name;
      //find all questionnaires with the depId equal to the template depId
      details = {'depId': result2.depId, 'type': 0};
      req.app.get("db").collection('mrelements').find(details).toArray((err, elements) => {
        if (err) {
          return  res.status(500).json({error: 'Error during questionnaires for the template finding.'});
        }
        const questionnaires = [];
        const qIds = [];
        for (element of elements) {
          questionnaires.push({id: element._id, name: element.name, questions: []});
          qIds.push(new ObjectId(element._id));
        }
        req.app.get("db").collection('questionnaires').find(
        {  _id: { $in: qIds }}, {fields:{"questions.id": 1, "questions.name": 1}}).toArray((err, questions) => {
          if (err) {
            return  res.status(500).json({error: 'Error during questions finding.'});
          }
          console.log('questions: ', questions);
          for (const q of questionnaires) {
            for (const question of questions) {
              if (question._id.toString() === q.id.toString()) {
                q.questions = question.questions;
              }
            }
          }
          result.questionnaires = questionnaires;
          console.log(result.questionnaires);
          return res.status(200).json({ t: result });
        });
      });
    });
  });
});


router.get('/getCreatedElement', (req, res, next) => {
  const id = req.query.id;
  let details = {  'initialId':new ObjectId(id)  };
  req.app.get("patientdb").collection('mrelements').find(details, {fields:{ _id: 1, type: 1 }}).toArray((err, elements) => {
    if (err) {
        console.log(err);
        return  res.status(500).json({error: 'Error during element deletion occured.'});
    }
    return res.status(200).json(elements);
  });
});


router.post('/hardDelete', (req, res, next) => {
    const data = req.body;
    console.log(data);
    let details = {_id: new ObjectId(data.id)};
    return req.app.get("db").collection('mrelements').remove(details, (err, result) => {
      if (err || !result) {
          console.log(err);
          return  res.status(500).json({error: 'Error during element remove.'});
      }
      if (data.isHardDelete) {
        const elements = [];
        const type = data.elements[0].type;
        for (const element of data.elements) {
          elements.push(new ObjectId(element._id))
        }
        details = {_id : {$in : elements}}
        console.log(elements);
        req.app.get("patientdb").collection('mrelements').remove(details, (err, result) => {
          let elementCollection = '';
          switch (type) {
            case 0: elementCollection = "questionnaires"; break;
            case 1: elementCollection = "templates"; break;
            case 2: elementCollection = "observedvalues"; break;
          }
          console.log(elementCollection);
          async.parallel([
              function(callback) {
                  if (elementCollection === '') { //is folder
                    const det = {folderId: {$in: elements}}
                      req.app.get('patientdb').collection('documents').update(det, {$unset: {folderId:1}} , {multi: true}, (err, res) => {
                        callback(err);
                      })
                  } else {
                    callback(null);
                  }
              },
              function(callback) {
                if (elementCollection === 'questionnaires') {
                    req.app.get("patientdb").collection(elementCollection).find(details).toArray((err, questionnaires) => {
                      if (err) {
                        console.log(err);
                        req.app.get("patientdb").collection(elementCollection).remove(details, (err, result) => {
                          callback(err);
                        });
                      }
                      console.log(questionnaires);
                      const ids = [];
                      for (const questionnaire of questionnaires) {
                        for (const question of questionnaire.questions) {
                          ids.push(question.id);
                        }
                      }
                      console.log(ids);
                      const det = {"parts.linkedQuestions" : {$in: ids}}
                      req.app.get("db").collection("templates").find(det).toArray((err, originaltemplates) => {
                        for (const id of ids) {
                          for (const template of originaltemplates) {
                            for (const part of template.parts) {
                              let regexp = new RegExp("--\\$"+ id+"--", 'g');
                              part.delta = part.delta.replace(regexp,"");
                              part.html = part.html.replace(regexp,"");
                              console.log(part.delta, 'after', regexp);
                              regexp = new RegExp("--\\$"+ id+"--.*\n", 'g')
                              part.notes = part.notes.replace(regexp, "");
                              part.linkedQuestions = part.linkedQuestions.splice(id, 1);
                            }
                          }
                        }
                        async.each(originaltemplates, function(template, callback) {
                          const det2 = {_id: new ObjectId(template._id)};
                          req.app.get("db").collection("templates").update(det2, { $set: template}, (err, res) => {
                            console.log('result', err);
                            callback(null);
                          });
                        }, function(err) {});
                        req.app.get("patientdb").collection("templates").find(det).toArray((err, templates) => {
                          if (!err && templates) {
                            console.log(templates);
                            for (const id of ids) {
                              for (const template of templates) {
                                for (const part of template.parts) {
                                  let regexp = new RegExp("--\\$"+ id+"--", 'g');
                                  part.delta = part.delta.replace(regexp,"");
                                  console.log(part.delta, 'after', regexp);
                                  regexp = new RegExp("--\\$"+ id+"--.*\n", 'g')
                                  part.notes = part.notes.replace(regexp, "");
                                  part.linkedQuestions = part.linkedQuestions.splice(id, 1);
                                }
                              }
                            }
                            async.each(templates, function(template, callback) {
                              const det2 = {_id: new ObjectId(template._id)};
                              req.app.get("patientdb").collection("templates").update(det2, { $set: template}, (err, res) => {
                                console.log('result', err);
                                callback(null);
                              });
                              }, function(err) {
                                req.app.get("patientdb").collection(elementCollection).remove(details, (err, result) => {
                                  callback(err);
                                });
                              });
                          } else {
                            console.log(err);
                            req.app.get("patientdb").collection(elementCollection).remove(details, (err, result) => {
                              callback(err);
                            });
                          }
                        });
                      });
                    })

                } else {
                  callback(null);
                }
              },
              function(callback) {
                if (elementCollection !== '' && elementCollection !== 'questionnaires') {
                    req.app.get("patientdb").collection(elementCollection).remove(details, (err, result) => {
                      callback(err);
                    });
                } else {
                  callback(null);
                }
              }
          ], function(err) {
            if (err) {
              console.log(err);
            }
            details = {depId: data.depId};
            req.app.get("db").collection('mrelements').find(details).toArray((err2, elements) => {
              if (err2) {
                return  res.status(500).json({error: 'Error during medical record elements finding.'});
              }
              console.log(elements);
              elements.sort(typeComparator);
              return res.status(200).json(elements);
            });
          });
        });
      } else {
        details = {depId: data.depId};
        req.app.get("db").collection('mrelements').find(details).toArray((err2, elements) => {
          if (err2) {
            return  res.status(500).json({error: 'Error during medical record elements finding.'});
          }
          elements.sort(typeComparator);
          return res.status(200).json(elements);
        });
      }
    });
});








function typeComparator(a,b) {
  return parseInt(b.type) - parseInt(a.type);
}


module.exports = router;



// //
// const depId = template._id;
// const currentDepId = template.currentId;
// if (template.parts.length > 0) {
//   let linkedQuestionnaires = [];
//   for (const part of template.parts) {
//     linkedQuestionnaires = linkedQuestionnaires.concat(part.linkedQuestions);
//   }
//   linkedQuestionnaires = linkedQuestionnaires.filter(function(item, pos, self) {
//       return self.indexOf(item) == pos;
//   })
//   console.log(linkedQuestionnaires);
//     req.app.get("db").collection('questionnaires').find({  "questions.id": { $in: linkedQuestionnaires }}).toArray((err, result2) => {
//       console.log('quetionnaires', result2);
//
//       for (let q of result2) {
//         details = {_id: q._id, depId: currentDepId}
//         console.log(details);
//             req.app.get("db").collection('mrelements').findOne(details, (err, result3) => {
//                 if (err) {
//                       return  res.status(500).json({error: 'Error during template creation.'});
//                 }
//                 console.log(result3);
//                 if (result3) {
//                   delete result3._id;
//                   result3.depId = depId;
//                   req.app.get("db").collection('mrelements').insert(result3, (err, result4) => {
//                     if (err) {
//                         return  res.status(500).json({error: 'Error during template creation.'});
//                     }
//                     q._id = new ObjectId(result4.ops[0]._id);
//                     req.app.get("db").collection('questionnaires').insert(q, (err, result5) => {
//                       if (err) {
//                         return  res.status(500).json({error: 'Error during template creation.'});
//                       }
//                       if (q === result2[result2.length - 1]) {
//                         return res.status(200).json({result: "ok"});
//                       }
//                     });
//                   });
//               }
//             });
//       }
//     });
// } else {
//     return res.status(200).json({result: "ok"});
// }
// });


function randomStr() {
	let s = '', r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i=0; i < 20; i++) { s += r.charAt(Math.floor(Math.random()*r.length)); }
	return s;
};
