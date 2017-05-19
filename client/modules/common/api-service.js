'use strict';

/**
 * Service for providing access the backend API via HTTP and WebSockets.
 */

angular.module('koan.common')
.factory('api', function ($rootScope, $http, $window) {

  var apiBase = 'api' /* base /api uri */,
      token = ($window.sessionStorage.token || $window.localStorage.token),
      headers = {Authorization: 'Bearer ' + token},
      wsHost = ($window.document.location.origin || ($window.location.protocol + '//' + $window.location.host)).replace(/^http/, 'ws'),
      api = {events: {}};

  // initiate the websocket connection to the host
  var ws = api.ws = new WebSocket(wsHost + '?access_token=' + token);
  $window.setInterval(function () {
    ws.send('ping');
  }, 1000 * 25); // keep-alive signal (needed for heroku)

  // utilize jQuery's callbacks as an event system
  function event() {
    var callbacks = $.Callbacks();
    return {
      subscribe: function ($scope, fn) {
        if (fn) {
          // unsubscribe from event on controller destruction to prevent memory leaks
          $scope.$on('$destroy', function () {
            callbacks.remove(fn);
          });
        } else {
          fn = $scope;
        }
        callbacks.add(fn);
      },
      unsubscribe: callbacks.remove,
      publish: callbacks.fire
    };
  }

  // websocket connected disconnected events
  api.connected = event();
  ws.onopen = function () {
    api.connected.publish.apply(this, arguments);
    $rootScope.$apply();
  };

  api.disconnected = event();
  ws.onclose = function () {
    api.disconnected.publish.apply(this, arguments);
    $rootScope.$apply();
  };

  // api http endpoints and websocket events
  api.posts = {
    list: function () {
      return $http({method: 'GET', url: apiBase + '/posts', headers: headers});
    },
    create: function (post) {
      return $http({method: 'POST', url: apiBase + '/posts', data: post, headers: headers});
    },
    created: event(),
    comments: {
      create: function (postId, comment) {
        return $http({method: 'POST', url: apiBase + '/posts/' + postId + '/comments', data: comment, headers: headers});
      },
      created: event()
    }
  };

  // api http endpoints and websocket events
  api.advertisements = {
    list: function () {
      return $http({method: 'GET', url: apiBase + '/advertisements', headers: headers});
    },
    uplaod: function (post) {
      return $http({method: 'POST', url: apiBase + '/advertisements', data: advertise, headers: headers});
    },
    uplaod: event(),
  };


  api.debug = {
    clearDatabase: function () {
      return $http({method: 'POST', url: apiBase + '/debug/clearDatabase', headers: headers});
    }
  };

  // websocket data event (which transmits json-rpc payloads)
  function index(obj, i) {
    return obj[i];
  } // convert dot notation string into an actual object index
  ws.onmessage = function (event /* websocket event object */) {
    var data = JSON.parse(event.data /* rpc event object (data) */);
    if (!data.method) {
      throw 'Malformed event data received through WebSocket. Received event data object was: ' + data;
    } else if (!data.method.split('.').reduce(index, api)) {
      throw 'Undefined event type received through WebSocket. Received event data object was: ' + data;
    }
    data.method.split('.').reduce(index, api).publish(data.params);
    $rootScope.$apply();
  };

  return api;
})
.directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;
          element.bind('change', function(){
             // scope.fileinput = changeEvent.target.files[0];
             scope.$apply(function(){
                //scope.filepreview = loadEvent.target.result;
                modelSetter(scope, element[0].files[0]);
             });
          });
       }
    };
 }])
.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
       var fd = new FormData();
       fd.append('file', file);
       $http.post('http://localhost:3000/api/advertisements', fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
       })
       .success(function(result){
        console.log(result)
       })
       .error(function(){
       });
    }
 }]);
// .service("uploadService", function($http, $q) {

//     return ({
//       upload: upload
//     });

//     function upload(file) {
//       var fd = new FormData();
//       fd.append('file', file);
//       var upl = $http({
//         method: 'POST',
//         url: 'http://localhost:3000/api/advertisements',
//         data:
//         transformRequest: angular.identity,
//         headers: {'Content-Type': undefined}
//       });
//       return upl.then(handleSuccess, handleError);

//     } // End upload function

//     // ---
//     // PRIVATE METHODS.
//     // ---
  
//     function handleError(response, data) {
//       if (!angular.isObject(response.data) ||!response.data.message) {
//         return ($q.reject("An unknown error occurred."));
//       }

//       return ($q.reject(response.data.message));
//     }

//     function handleSuccess(response) {
//       return (response);
//     }

// })
// .directive("fileinput", [function() {
//     return {
//       scope: {
//         fileinput: "=",
//         filepreview: "="
//       },
//       link: function(scope, element, attributes) {
//         element.bind("change", function(changeEvent) {
//           console.log(changeEvent.target.files)
//           scope.fileinput = changeEvent.target.files[0];
//           var reader = new FileReader();
//           reader.onload = function(loadEvent) {
//             scope.$apply(function() {
//               scope.filepreview = loadEvent.target.result;
//             });
//           }
//           reader.readAsDataURL(scope.fileinput);
//         });
//       }
//     }
// }]);