'use strict';


angular.module('koan.advertise').controller('AdvertiseCtrl', ['$scope', 'fileUpload', function($scope, fileUpload){
    $scope.uploadFile = function(){
       var file = $scope.myFile;
       fileUpload.uploadFileToUrl(file);
    };
 }]);

  