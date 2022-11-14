const jwt = require('jsonwebtoken');
var multiplayer = require('./multiplayer_game');
const dotenv = require("dotenv");

dotenv.config();

KEY = process.env.PLAYERS_KEY

var game_codes = []
var multiplayer_games = {}

function createMultiplayerGame(req, res, client){

    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        email = decode.email;
        client.query('SELECT * FROM Players WHERE email = $1', [email])
            .then(result => {
                if(result.length != 0) {
                    while(true){
                        game_code=Math.floor(
                            Math.random() *(99999) + 10000
                        );
                        if(!game_codes.includes(game_code)){
                            game_codes.push(game_code);
                            break; 
                        }
                    }
                    console.log(game_codes);
                    const game = new multiplayer.MultiplayerGame(email, null);
                    multiplayer_games[game_code] = game;
                    return res.send({status: true, msg: game_code});
                }else{
                    console.log("[createMultiplayerGame] Player not found")
                    return res.send({status: false, msg:"error"});
                }
            })
            .catch(err => {
                console.log(err.toString());
                return res.send({status: false, msg:"error"});
            })
    }catch(error) {
        console.log(error.toString());
        return res.send({status: false, msg:"error"});
    }   
}

function checkForPlayer2(req, res){
    game = multiplayer_games[req.body.game_code];
    if(game.getPlayer2() == null){
        game.setcheckForPlayer2Time(Date.now());
        return res.send({status: false, msg: "player 2 not found"});
    }else{
        return res.send({status: true, msg: "player 2 found"});
    } 
}

function joinGame(req, res, client){
    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        email = decode.email;
        client.query('SELECT * FROM Players WHERE email = $1', [email])
            .then(result => {
                if(result.length != 0) {
                    game_code = parseInt(req.body.game_code, 10);
                    console.log("[joinGame] game_code: " + game_code);
                    console.log(typeof game_code);
                    console.log(game_codes);
                    console.log(typeof game_codes[0]);
                    console.log("game_codes[0] == game_code: " + game_codes[0] == game_code);
                    console.log("game_code in game_codes: " + game_code in game_codes);
                    
                    if(game_code in game_codes){
                        multiplayer_games[game_code].setUsernamePlayer2(result.rows[0].username);
                        multiplayer_games[game_code].setPlayer2(email);
                        return res.send({status: true, msg: "ok"});
                    }else{
                        console.log("[joinGame] Wrong code");
                        return res.send({status: false, msg: "wrong code"});
                    }
                }else{
                    console.log("[joinGame] Player not found");
                    return res.send({status: false, msg:"error"});
                }
            })
            .catch(err => {
                console.log(err.toString());
                return res.send({status: false, msg:"error"});
            })
    }catch(error) {
        console.log(error.toString());
        return res.send({status: false, msg:"error"});
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