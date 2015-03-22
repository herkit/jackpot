var EventEmitter = require('events').EventEmitter,
    util = require('util'), merge = require('merge');

var roll = function() {
  return Math.floor(Math.random() * 6) + 1;
}

var sum = function(previousValue, currentValue, index, array) {
  return previousValue + currentValue;
};

var isAllNonNumeric = function(previousValue, currentValue, index, array) {
  return (isNaN(previousValue) || previousValue === true) && isNaN(currentValue);
};

var Game = function(gameId) {
  var self = this;
  var events = new EventEmitter();

  var letters = ["·", "J", "A", "C", "K", "P", "O", "T", "·"];

  self.state = {
    id: gameId,
    players: [],
    currentplayerid: -1,
    currentplayer: {},
    digits: [ 1, 2, 3, 4, 5, 6, 7, 8, 9],
    dice: [roll(), roll()],
    mode: "registering"
  };

  console.log(letters.reduce(isAllNonNumeric));
  console.log(self.state.digits.reduce(isAllNonNumeric));

  self.diceTotal = function() { return self.state.dice.reduce(sum); }

  self.hasPlayer = function(player) {
    for (i in self.state.players) {
      if (self.state.players[i].id === player.id)
        return true;
    }
    return false;
  }

  self.error = function(message, callback) {
    var err = { gameid: self.state.id, message: message };
    if (typeof(callback) === "function") 
      callback(err, self.state);
    self.emit("error", err);
  }

  self.addPlayer = function(player, callback) {
    if (!self.hasPlayer(player))
    {
      self.state.players.push(merge.recursive(true, player, { win: 0, loss: 0 }));
      if (typeof(callback) === "function") 
        callback(null, self.state);
      self.emit("newplayer", self.state);
    } else {
      self.error("Player is already in this game", callback); 
    }
  }

  self.nextPlayer = function(callback) {
    if (self.state.players.length > 0) {
      self.state.currentplayerid = (self.state.currentplayerid + 1) % self.state.players.length;
      self.state.currentplayer = self.state.players[self.state.currentplayerid];
      self.state.digits = [ 1, 2, 3, 4, 5, 6, 7, 8, 9];
      self.state.mode = "roll";
      if (typeof(callback) === "function") 
        callback(null, self.state);
      self.emit("statechange", self.state);
    } else {
      self.error("No players registered", callback);
    }
  }

  self.select = function(digit, callback) {
    var diceTotal = self.state.dice.reduce(sum);
    if (self.state.mode === "select") {
      if (self.state.dice.indexOf(digit) >= 0 || digit === diceTotal) {
        var digitIndex = self.state.digits.indexOf(digit);
        if (digitIndex >= 0) {
          self.state.digits[digitIndex] = letters[digitIndex];
          self.state.mode = "roll";

          if (self.state.digits.reduce(isAllNonNumeric)) {
            self.state.players[self.state.currentplayerid].win = (self.state.players[self.state.currentplayerid].win || 0) + 1;
            self.state.mode = "finish";
          }

          if (typeof(callback) === "function")
            callback(null, self.state);
          self.emit("statechange", self.state);
        } else {
          self.error("This number has already been turned", callback); 
        }
      } else {
        self.error("Your dice does not show this number", callback);
      }
    } else {
      self.error("You must roll dice", callback);
    }
  }

  self.rollDice = function(callback) {
    console.log(self.state);
    if (self.state.mode === "roll") {
      self.state.dice[0] = roll();
      self.state.dice[1] = roll();

      if (self.state.digits.indexOf(self.state.dice[0]) < 0 && self.state.digits.indexOf(self.state.dice[1]) < 0 && self.state.digits.indexOf(self.diceTotal()) < 0) {
        console.log(self.state.digits + " is all non numeric? " + self.state.digits.reduce(isAllNonNumeric));
        if (self.state.digits.reduce(isAllNonNumeric)) {
          self.state.players[self.state.currentplayerid].win = (self.state.players[self.state.currentplayerid].win || 0) + 1;
        } else {
          self.state.players[self.state.currentplayerid].loss = (self.state.players[self.state.currentplayerid].loss || 0) + 1;
        }
        self.state.mode = "finish";
      } else {
        self.state.mode = "select";
      }

      if (typeof(callback) === "function")
        callback(null, self.state);
      self.emit("roll", self.state);
    } else {
      self.error("You are not allowed to roll yet", callback);
    }
  }
}

util.inherits(Game, EventEmitter);

module.exports = Game;