var jackpotApp = angular.module('jackpotApp', []);

io = io.connect();

jackpotApp.config(function ($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});

jackpotApp.controller('jackpotGameCtrl', ['$scope', '$http', function ($scope, $http) {
  letters = ["-", "J", "A", "C", "K", "P", "O", "T", "-"];

  $http.get("./state").
  success(function(data, status, headers, config) {
    $scope.state = data;
  });

  /*$scope.state = {};
  $scope.state.digits = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
  $scope.state.dice = [1, 6];*/
  $scope.gameid = "";
  $scope.myname = "";
  $scope.join = function() {

  };
  $scope.buttonsuccess = function(i) {
    return angular.isNumeric(i) ? false : true;
  };
  $scope.ian = function (i) { console.log("ian " + i); return !isNaN(parseFloat(i)) && isFinite(i); };
  $scope.nan = function (i) { console.log("nan " + i); return isNaN(parseFloat(i)); };
  $scope.select = function(i) {
    var idx = $scope.state.digits.indexOf(i);
    if (idx >= 0) {
      var diceTotal = $scope.state.dice.reduce(function(previousValue, currentValue, index, array) {
        return previousValue + currentValue;
      });
      if ($scope.state.dice.indexOf(i) >= 0 || i == diceTotal) {
        $scope.state.digits[idx] = letters[idx];
      }
    }
  };
  $scope.roll = function() {
    var rolls = [];
    for(i in $scope.state.dice) {
      rolls.push(Math.floor(Math.random() * 20) + 1);
      $scope.state.dice[i] = Math.floor(Math.random() * 6) + 1;

    }
  };
}]);