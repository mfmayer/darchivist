function logResult (result) {
  console.log(result);
}

function logError (error) {
  console.log('Calling API Error: \n', error);
}

function readResponseAsJSON (response) {
  if (!response.ok) {
    throw response.statusText;
  }
  return response.json();
}

function getJSON (pathToResource) {
  return fetch(pathToResource, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  }).then(readResponseAsJSON)
}

function postJSON (pathToResource, object) {
  return fetch(pathToResource, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object)
  }).then(readResponseAsJSON)
}

function InitAPI (apiURL) {
  const API = {
    get: function (path) {
      return getJSON(apiURL + path)
    },
    post: function (path, object) {
      return postJSON(apiURL + path, object)
    },

    getArchivePath: function () {
      return getJSON(apiURL + "archivePath").then(function (response) {
        if (response.title != null) {
          return response.title
        }
        return "unknown"
      })
    },

    getVersion: function () {
      return getJSON(apiURL + "version").then(function (response) {
        if (response.version != null) {
          return response.version
        }
        return "unknown"
      })
    },

    setName: function (name) {
      var body = {
        name: name
      }
      return postJSON(apiURL + "setName", body).then(function (response) {
        if (response.message != null) {
          return response.message
        }
        return ""
      })
    },

  }
  return API
}

export { InitAPI }