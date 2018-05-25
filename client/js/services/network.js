import axios from 'axios'

const DEP_URL = `/network/`;

export default {

  addDepartment: (id, name, callback) => {
    const data = {
      id,
      name,
    };
    const url = DEP_URL + 'add';
    return post(url, data, callback);
  },

  getInfo: (id, callback) => {
    const url = DEP_URL + 'info?id=' + id;
    return get(url, callback);
  },

  sendRequest: (toId, depId, callback) => {
    const data = {
      toId,
      depId,
    };
    const url = DEP_URL + 'request';
    return post(url, data, callback);
  },

  confirmRequest: (data, callback) => {
    const url = DEP_URL + 'confirm';
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
