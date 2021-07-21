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

function updateAppData (app, response) {
  if (response.notification !== undefined) {
    app.$q.notify(response.notification)
  }
  if (response.undoRedoCount !== undefined) {
    app.$refs.mainMenu.undoCount = response.undoRedoCount[0]
    app.$refs.mainMenu.redoCount = response.undoRedoCount[1]
  }
  if (response.files !== undefined) {
    Object.freeze(response.files)
    app.files = response.files
  }
  if (response.tags !== undefined) {
    Object.freeze(response.tags)
    app.tags = response.tags
  }
  if (response.languages !== undefined) {
    app.$refs.mainMenu.languages = response.languages
  }
  if (response.currentLanguage !== undefined) {
    app.$refs.mainMenu.currentLanguage = response.currentLanguage
    // also handle loglist that should contain translated log messages
    if (response.logs !== undefined) {
      for (var i = 0; i < response.logs.length; i++) {
        response.logs[i].time = new Date(response.logs[i].time);
      }
      app.$refs.logList.logs = response.logs.slice().reverse()
    }
  } else if (response.logs !== undefined) {
    for (var i = response.logs.length - 1; i >= 0; i--) {
      response.logs[i].time = new Date(response.logs[i].time);
      app.$refs.logList.logs.unshift(response.logs[i])
    }
    //app.$refs.logList.logs = response.logs.slice().reverse()
  }
}

function InitAPI (apiURL, app) {
  const API = {
    get: function (path, abortController) {
      return getJSON(apiURL + path, abortController).then(
        response => {
          updateAppData(app, response)
          return response
        },
        error => {
          app.$q.notify('Looks like there was an API problem: ' + error)
        })
    },
    post: function (path, object, abortController) {
      return postJSON(apiURL + path, object, abortController).then(
        response => {
          updateAppData(app, response)
          return response
        },
        error => {
          app.$q.notify('Looks like there was an API problem: ' + error)
        })
    }
  }
  return API
}

export { InitAPI }