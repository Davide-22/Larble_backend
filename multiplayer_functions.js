const jwt = require('jsonwebtoken');
var multiplayer = require('./multiplayer_game');

var game_codes = []
var multiplayer_games = {}

function createMultiplayerGame(req, res, client){

    token = req.body.token;
    try{
        const decode = jwt.verify(token, 'testkey');
        email = decode.email;
        client.query('SELECT * FROM users WHERE email = $1', [email])
            .then(result => {
                if(result.length == 0) return;
            })
            .catch(err => {
                console.log(err.toString());
                return res.send({status: false, msg:"error"});
            })
    }catch(error) {
        console.log(error.toString());
        return res.send({status: false, msg:"error"});
    }
    
    while(true){
        game_code=Math.floor(
            Math.random() *(99999) + 10000
          );

        if(!game_codes.includes(game_code)){
            game_codes.push(game_code);
            break; 
        }
    }
    const game = new multiplayer.MultiplayerGame(email, null);
    multiplayer_games[game_code] = game;
    return res.send({status: true, msg: game_code});

}

function checkForPlayer2(req, res){
    game = multiplayer_games[req.body.game_code];
    if(game.getPlayer2() == null){
        return res.send({status: false, msg: "player 2 not found"});
    }else{
        return res.send({status: true, msg: "player 2 found"});
    } 
}

function joinGame(req, res){
    game_code = req.body.game_code;
    if(game_code in game_codes){
        multiplayer_games[game_code].setPlayer2(req.body.email);
    }else{
        return res.send({status: false, msg: "wrong code"});
    }
}

function handleMultiplayerGame(req, res){
    game_code = req.body.game_code;
    email = req.body.email;
    game = multiplayer_games[game_code];
    x = req.body.x;
    y = req.body.y;
    if(email == game.getPlayer1()){

    }else if(email == game.getPlayer2()){

    }else{
        console.log("error handleMultiplayerGame");
    }
}

module.exports = {
    createMultiplayerGame, 
    handleMultiplayerGame,
    checkForPlayer2,
    joinGame
}