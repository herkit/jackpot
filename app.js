var express = require('express.io'),
    exphbs  = require('express-handlebars');

var app = express();

//app.http.io();

var games = {};

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
  res.render('home');
});

app.get("/game/:game", function(req, res) {
  res.render('game');
});

app.get("/game/:game/state", function(req, res) {
  if (!games[req.params.game]) {
    games[req.params.game] = { digits: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] };
  }
  res.json(games[req.params.game]);
});

app.listen(process.env.PORT || 3000);