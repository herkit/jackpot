var roll = function() {
  return Math.floor(Math.random() * 6) + 1;
}

var sum = function(previousValue, currentValue, index, array) {
  return previousValue + currentValue;
};

module.exports = function(gameId, player) {
  var self = this;

  var letters = ["·", "J", "A", "C", "K", "P", "O", "T", "·"];

  self.state = {
    id: gameId,
    players: [player],
    currentplayer: 0,
    digits: [ 1, 2, 3, 4, 5, 6, 7, 8, 9],
    dice: [roll(), roll()],
    mode: "roll"
  };

  self.diceTotal = function() { return self.state.dice.reduce(sum); }

  self.addPlayer = function(player, callback) {
    self.state.players.push(player);
    callback(null, self.state);
  }

  self.select = function(digit, callback) {
    var diceTotal = self.state.dice.reduce(sum);
    if (self.state.mode === "select") {
      if (self.state.dice.indexOf(digit) >= 0 || digit === diceTotal) {
        var digitIndex = self.state.digits.indexOf(digit);
        if (digitIndex >= 0) {
          self.state.digits[digitIndex] = letters[digitIndex];
          self.state.mode = "roll";
          callback(null, self.state);
        } else {
          callback({ message: "This number has already been turned"}, self.state);
        }
      } else {
        callback({ message: "Your dice does not show this number" }, self.state);
      }
    } else {
      callback({ message: "You must roll dice" }, self.state);
    }
  }

  self.rollDice = function(callback) {
    console.log(self.state);
    if (self.state.mode === "roll") {
      self.state.dice[0] = roll();
      self.state.dice[1] = roll();

      if (self.state.digits.indexOf(self.state.dice[0]) < 0 && self.state.digits.indexOf(self.state.dice[1]) < 0 && self.state.digits.indexOf(self.diceTotal()) < 0) {
        if (self.state.digits === letters) {
          self.state.players[self.state.currentplayer].win == 1 || self.state.players[self.state.currentplayer].win + 1;
        } else {
          self.state.players[self.state.currentplayer].loss == 1 || self.state.players[self.state.currentplayer].loss + 1;
        }
        self.state.mode = "finish";
      } else {
        self.state.mode = "select";
      }

      callback(null, self.state);
    } else {
      callback({ message: "You are not allowed to roll yet" }, self.state);
    }
  }
}