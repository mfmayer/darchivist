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

function getJSON (pathToResource, abortController) {
  var signal
  if (abortController != null) {
    signal = abortController.signal
  }
  return fetch(pathToResource, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    signal: signal
  }).then(readResponseAsJSON)
}

function postJSON (pathToResource, object, abortController) {
  var signal
  if (abortController != null) {
    signal = abortController.signal
  }
  return fetch(pathToResource, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(object),
    signal: signal
  }).then(readResponseAsJSON)
}

function InitAPI (apiURL, $q) {
  const API = {
    get: function (path, abortController) {
      return getJSON(apiURL + path, abortController).then(result => {
        if (result.notification !== undefined) {
          $q.notify(result.notification)
        }
        return result
      })
    },
    post: function (path, object, abortController) {
      return postJSON(apiURL + path, object, abortController).then(result => {
        if (result.notification !== undefined) {
          $q.notify(result.notification)
        }
        return result
      })
    }
  }
  return API
}

export { InitAPI }