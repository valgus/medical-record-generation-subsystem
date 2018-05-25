import axios from 'axios'

const MEDREC_URL = `/medrec/`;

export default {

  save: (data, callback) => {
    const url = MEDREC_URL + 'save'
    return post(url, data, callback);
  },

  getAll: (id, callback) => {
    const url = MEDREC_URL + 'all?id=' + id
    return get(url, callback);
  },

  getInfoElements: (id, callback) => {
    const url = MEDREC_URL + 'infoElements?id=' + id
    return get(url, callback);
  },

  delete: (data, callback) => {
    const url = MEDREC_URL + 'delete';
    return post(url, data, callback);
  },

  setNewName: (id, name, callback) => {
    const url = MEDREC_URL + 'setName';
    return post(url, {id, name}, callback);
  },

  saveFolder: (data, callback) => {
    const url = MEDREC_URL + 'saveFolder';
    return post(url, data, callback);
  },

  cloneFolder: (data, callback) => {
    const url = MEDREC_URL + 'cloneFolder';
    return post(url, data, callback);
  },

  getFolder: (id, callback) => {
    console.log(id);
    const url = MEDREC_URL + 'getFolder?id=' + id
    return get(url, callback);
  },

  saveObValue: (data, callback) => {
    const url = MEDREC_URL + 'saveObValue';
    return post(url, data, callback);
  },

  cloneObValue: (data, callback) => {
    const url = MEDREC_URL + 'cloneObValue';
    return post(url, data, callback);
  },

  getObValue: (id, callback) => {
    console.log(id);
    const url = MEDREC_URL + 'getObValue?id=' + id
    return get(url, callback);
  },

  saveQuestionnaire: (data, callback) => {
    const url = MEDREC_URL + 'saveQuestionnaire';
    return post(url, data, callback);
  },

  cloneQuestionnaire: (data, callback) => {
    const url = MEDREC_URL + 'cloneQuestionnaire';
    return post(url, data, callback);
  },

  getQuestionnaire: (id, callback) => {
    console.log(id);
    const url = MEDREC_URL + 'getQuestionnaire?id=' + id
    return get(url, callback);
  },

  saveTemplate: (data, callback) => {
    const url = MEDREC_URL + 'saveTemplate';
    return post(url, data, callback);
  },

  cloneTemplate: (data, callback) => {
    const url = MEDREC_URL + 'cloneTemplate';
    return post(url, data, callback);
  },

  getTemplate: (id, callback) => {
    console.log(id);
    const url = MEDREC_URL + 'getTemplate?id=' + id
    return get(url, callback);
  },

  findCreatedElement: (id, callback) => {
    console.log(id);
    const url = MEDREC_URL + 'getCreatedElement?id=' + id
    return get(url, callback);
  },

  hardDelete: (data, callback) => {
    const url = MEDREC_URL + 'hardDelete';
    return post(url, data, callback);
  },


}


function post(url, data, callback) {
  return axios.post(url, data)
    .then((response) => {
      console.log(response.data);
      callback(null, response.data);
    })
    .catch((err) => {
      console.log(err);
      callback(new Error(err))
    });
}

function get(url, callback) {
  return axios.get(url)
    .then((response) => {
      console.log(response.data);
      callback(null, response.data);
    })
    .catch((err) => {
      console.log(err);
      callback(new Error(err))
    });
}
