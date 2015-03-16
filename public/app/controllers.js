var phonecatApp = angular.module('jackpotApp', ["interpolateProvider"]);

phonecatApp.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});

phonecatApp.controller('jackpotGameCtrl', function ($scope) {
  $scope.digits = [ "1", "2", "3", "4", "5", "6", "7", "8", "9" ];
});