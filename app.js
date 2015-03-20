var express = require('express.io'),
    Game = require('./lib/game'),
    merge = require('merge');

var app = express();
app.http().io();

// Setup your sessions, just like normal.
app.use(express.cookieParser())
app.use(express.session({secret: 'jackpot'}))

app.io
  .route('join', function(req) {
    console.log("socket-io: join(" + req.data.gameid + ")");
    var game = getGame(req.data.gameid);

    var joinMessage = { name: req.data.name || "Player " + (game.state.players.length + 1), id: req.session.id };
    console.log(joinMessage);

    game.addPlayer(joinMessage, function(err, state) {
      console.log(err);
      console.log(state);
      if (err)
        req.io.room(state.id).broadcast("error", err);
      else {
        console.log("socket-id: join " + state.id);
        app.io.broadcast("gamestate", state);
      }
    });
  });
app.io
  .route('ready', function(req) {
    req.io.join(req.data.gameid);
  }); 
app.io
  .route('next', function(req) {
    var game = getGame(req.data.gameid);
    game.nextPlayer();    
  });
app.io
  .route('roll', function(req) {
    console.log("socket-io: roll(" + req.data.gameid + ")");
    var game = getGame(req.data.gameid);
    if (game.state.currentplayer.id === req.session.id)
      game.rollDice(emitState('roll'));
    else {
      app.io.broadcast("error", { message: "It is " + game.state.currentplayer.name + "'s turn" });
    }
  });
app.io
  .route('select', function(req) {
    var game = getGame(req.data.gameid);
    if (game.state.currentplayer.id === req.session.id)
      game.select(req.data.digit, emitState('select'));
    else
      app.io.room(game.state.id).broadcast("error", { message: "It is " + game.state.currentplayer.name + "'s turn" });
  });  

var games = {};

var getGame = function(gameId) {
  if (!games[gameId]) {
    games[gameId] = new Game(gameId);
    games[gameId]
    .on("statechange", function(state) {
      app.io.room(state.id).broadcast("gamestate", state);
    })
    .on("roll", function(state) {
      app.io.room(state.id).broadcast("roll", state);
    })
    .on("error", function(err) {
      console.log("error:" + err);
    })
    .on("newplayer", function() {
      console.log("newplayer");
      app.io.broadcast("gamelist:update", getGameList());
    })
    app.io.broadcast("gamelist:update", getGameList());
  }
  return games[gameId];
}

var getGameList = function() {
  var gamelist = [];
  for(id in games) {
    var game = games[id];
    gamelist.push({ id: id, players: game.state.players.length, mode: game.state.mode });
  }
  return gamelist;
}

var outputState = function(req, res) {
  return function(err, state) {
    if (err) {
      res.json(err, 403);
    } else {
      console.log(state);
      res.json(merge.recursive(true, state, { you: req.session.id }));
    }
  }
};

var emitState = function(method) {
  return function(err, state) {
    console.log("emitState");
    if (err) {
      app.io.room(state.id).broadcast("error", err);
    } else {
      app.io.room(state.id).broadcast(method || "gamestate", state);
    }
  }
};


app.set('port', (process.env.PORT || 3000))

app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));
app.use(require('morgan')('dev'));

app.get('/', function (req, res) {
  res.render('home');
});

app.get("/game", function(req, res) {
  res.json(getGameList());
});

app.get("/game/:game/state", function(req, res) {
  outputState(req, res)(null, getGame(req.params.game).state)
});

app.get("/game/:game/roll", function(req, res) {
  var game = getGame(req.params.game);
  if (game.state.currentplayer.id === req.session.id)
    game.rollDice(outputState(req, res));
  else
    res.json({ message: "It is not your turn" }, 403);
});

app.get("/game/:game/select", function(req, res) {
  var game = getGame(req.params.game);
  if (game.state.currentplayer.id === req.session.id)
    game.select(parseInt(req.query.digit), outputState(req, res));
  else
    res.json({ message: "It is not your turn" }, 403);
});

app.get("/game/:game/join", function(req, res) {
  var game = getGame(req.params.game);
  game.addPlayer({ name: "Player " + (game.state.players.length + 1), id: req.session.id }, outputState(req, res));
});

app.get("/game/:game/next", function(req, res) {
  getGame(req.params.game).nextPlayer(outputState(req, res));
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});