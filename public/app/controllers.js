var jackpotApp = angular.module('jackpotApp', [
  'jackpotApp.services',
  'btford.socket-io'
])

jackpotApp.config(function ($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});

jackpotApp.controller('jackpotGameCtrl', ['$scope', 'socket', function ($scope, socket) {
  letters = ["-", "J", "A", "C", "K", "P", "O", "T", "-"];

  /*$http.get("./state").
  success(function(data, status, headers, config) {
    $scope.state = data;
  });*/

  $scope.state = {};
  $scope.state.digits = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
  $scope.state.dice = [1, 6];

  socket.on("gamestate", function(data) {
    console.log(data);
    $scope.state = data;
  });

  $scope.gameid = "asdf";
  $scope.myname = "";
  $scope.join = function() {
    socket.emit("join", { gameid: $scope.gameid });
  };
  $scope.buttonsuccess = function(i) {
    return angular.isNumeric(i) ? false : true;
  };
  $scope.ian = function (i) { return !isNaN(parseFloat(i)) && isFinite(i); };
  $scope.nan = function (i) { return isNaN(parseFloat(i)); };
  $scope.select = function(i) {
    $socket.emit("select", { gameid: $scope.gameid, digit: i });
  };
  $scope.roll = function() {
    console.log($scope);
    $socket.emit("roll", { gameid: $scope.gameid });
    /*var rolls = [];
    for(i in $scope.state.dice) {
      rolls.push(Math.floor(Math.random() * 20) + 1);
      $scope.state.dice[i] = Math.floor(Math.random() * 6) + 1;

    }*/
  };
}]);