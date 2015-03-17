var jackpotApp = angular.module('jackpotApp', []);

jackpotApp.config(function ($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});

jackpotApp.controller('jackpotGameCtrl', function ($scope) {
  letters = ["-", "J", "A", "C", "K", "P", "O", "T", "-"];
  $scope.digits = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
  $scope.dice = [1, 6];
  $scope.select = function(i) {
    var idx = $scope.digits.indexOf(i);
    if (idx >= 0) {
      var diceTotal = $scope.dice.reduce(function(previousValue, currentValue, index, array) {
        return previousValue + currentValue;
      });
      if ($scope.dice.indexOf(i) >= 0 || i == diceTotal) {
        $scope.digits[idx] = letters[idx];
      }
    }
  };
  $scope.roll = function() {
    var rolls = [];
    for(i in $scope.dice) {
      rolls.push(Math.floor(Math.random() * 20) + 1);
      $scope.dice[i] = Math.floor(Math.random() * 6) + 1;

    }
  };
});