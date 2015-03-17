var express = require('express.io'),
    exphbs  = require('express-handlebars'),
    Game = require('./lib/game');

var app = express();

//app.http.io();

var games = {};

var getGame = function(gameId) {
  if (!games[gameId]) {
    games[gameId] = new Game(gameId, { Name: "Player 1", Win: 0, Loss: 0 });
  }
  return games[gameId];
}

app.set('port', (process.env.PORT || 3000))

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('home');
});

app.get("/game/:game", function(req, res) {
  res.render('game', getGame(req.params.game).state);
});

app.get("/game/:game/state", function(req, res) {
  res.json(getGame(req.params.game));
});

app.get("/game/:game/roll", function(req, res) {
  res.setHeader("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')");
  getGame(req.params.game).rollDice(function(err, state) {
    if (err) {
      res.json(err, 403);
    } else {
      res.json(state);
    }
  });
});

app.get("/game/:game/select/:number", function(req, res) {
  getGame(req.params.game).select(parseInt(req.params.number), function(err, state) {
    if (err) {
      res.json(err, 403);
    } else {
      res.json(state);
    }
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});