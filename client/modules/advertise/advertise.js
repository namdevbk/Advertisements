'use strict';

/**
 * Home module for displaying home page content.
 */

angular
    .module('koan.advertise', [
      'ngRoute',
      'koan.common'
    ])
    .config(function ($routeProvider) {
      $routeProvider
          .when('/advertise', {
            title: 'KOAN Advertise',
            templateUrl: 'modules/advertise/advertise.html',
            controller: 'AdvertiseCtrl'
          });
    });