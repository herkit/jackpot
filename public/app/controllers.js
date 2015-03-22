var jackpotApp = angular.module('jackpotApp', [
  'ngRoute',
  'jackpotApp.services',
  'btford.socket-io'
])

jackpotApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/games/:gameId', {
        templateUrl: 'partials/game.html',
        controller: 'jackpotGameCtrl'
      }).
      when('/welcome', {
        templateUrl: 'partials/welcome.html',
        controller: 'WelcomeCtrl'
      }).
      otherwise({
        redirectTo: '/welcome'
      });
  }]);

jackpotApp.filter("nextButtonTitle", function() { return function (state) {
  if (state === "finish") return "Next";
  if (state === "registering") return "Start";
  return "";
}});

/*jackpotApp.config(function ($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});*/

jackpotApp.controller('WelcomeCtrl', ['$scope', '$location', function($scope, $location) {
  $scope.newGame = function() {
    console.log("newGame");
    $location.path("/games/asdfaet2345");
  }
}]);

jackpotApp.controller('GameListCtrl', ['$scope', '$http', 'socket', function ($scope, $http, socket) {
  $scope.games = [];
  $http.get("/game").success(function(data) {
    $scope.games = data;
  });

  socket.on("gamelist:update", function(data) {
    $scope.games = data;
  });
}]);

jackpotApp.controller('jackpotGameCtrl', ['$scope', 'socket', '$routeParams', '$http', function ($scope, socket, $routeParams, $http) {
  letters = ["-", "J", "A", "C", "K", "P", "O", "T", "-"];


  $scope.state = {};
  $scope.state.digits = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
  $scope.dice = [1, 6];

  socket.on("gamestate", function(data) {
    $scope.state = data;
    $scope.dice = $scope.state.dice;
    $scope.error = "";
  });

  animateRoll = function(rolls, callback) {
    if (rolls > 0)
    {
      for(i in $scope.dice) {
        $scope.dice[i] = Math.floor(Math.random() * 6) + 1;
      }
      setTimeout(20, function() { animateRoll(rolls--, callback); });
    } else {
      callback();
    }
  }

  socket.on("roll", function(data) {
    $scope.state = data;
    $scope.dice = $scope.state.dice;
  });

  socket.on("error", function(error) {
    $scope.error = error.message;
    setTimeout(1500, function() { $scope.error = ""; });
  });

  socket.on("you", function(data) {
    console.log("you");
    $scope.me = data.you;
  });

  $scope.gameid = $routeParams.gameId;
  $http.get("/game/" + $scope.gameid + "/state")
    .success(function(data, status, headers, config) {
      $scope.state = data;
    });
  socket.emit("ready", { gameid: $scope.gameid });

  $scope.myname = "";
  $scope.join = function() {
    socket.emit("join", { gameid: $scope.gameid });
  };
  $scope.start = function() {
    console.log("start");
    socket.emit("next", { gameid: $scope.gameid });
  };
  $scope.buttonsuccess = function(i) {
    return angular.isNumeric(i) ? false : true;
  };
  $scope.ian = function (i) { return !isNaN(parseFloat(i)) && isFinite(i); };
  $scope.nan = function (i) { return isNaN(parseFloat(i)); };
  $scope.select = function(i) {
    socket.emit("select", { gameid: $scope.gameid, digit: i });
  };
  $scope.roll = function() {
    socket.emit("roll", { gameid: $scope.gameid });
    /*var rolls = [];
    for(i in $scope.state.dice) {
      rolls.push(Math.floor(Math.random() * 20) + 1);
      $scope.state.dice[i] = Math.floor(Math.random() * 6) + 1;

    }*/
  };
  $scope.showNext = function() {
    return (($scope.state.mode === 'registering' && $scope.state.players.length > 0) || $scope.state.mode === 'finish');
  }
}]);