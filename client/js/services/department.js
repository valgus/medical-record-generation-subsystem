import axios from 'axios'

const DEP_URL = `/department/`;

export default {

  save: (data, callback) => {
    const url = DEP_URL + 'save'
    return post(url, data, callback);
  },

  getAll: (callback) => {
    const url = DEP_URL + 'all'
    return get(url, callback);
  },

  delete: (data, callback) => {
    const url = DEP_URL + 'delete';
    return post(url, data, callback);
  },

  getUserDeps: (id, level, callback) => {
    const url = DEP_URL + 'userAll?id=' + id + '&level=' + level;
    return get(url, callback);
  },

  setNewName: (id, name, callback) => {
    const url = DEP_URL + 'setName';
    return post(url, {id, name}, callback);
  },

  findMedrecs: (id, callback) => {
    const url = DEP_URL + 'findMedrecs?id=' + id;
    return get(url, callback);
  },
  hardDelete: (data, callback) => {
    const url = DEP_URL + 'hardDelete';
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
