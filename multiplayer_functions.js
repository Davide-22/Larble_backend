const jwt = require('jsonwebtoken');
const multiplayer = require('./multiplayer_game');
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
        console.log(`[createMultiplayerGame] Creating Multiplayer game by ${email}`);
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
                    labyrinth = req.body.labyrinth;
                    const game = new multiplayer.MultiplayerGame(email, null, labyrinth);
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
    console.log("[checkForPlayer2] Checking for player 2...");
    game = multiplayer_games[req.body.game_code];
    if(game.getPlayer2() == null){
        game.setLastAcces();
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
                    console.log(`[joinGame] Joining game with game_code=${game_code}`);
                    
                    if(game_codes.includes(game_code)){
                        if(multiplayer_games[game_code].getPlayer2() != null){
                            return res.send({status: false, msg: "Game already started"});
                        }
                        if(multiplayer_games[game_code].getPlayer2() == email){
                            return res.send({status: false, msg: "You can't play with yourself"});
                        }
                        multiplayer_games[game_code].setUsernamePlayer2(result.rows[0].username);
                        multiplayer_games[game_code].setPlayer2(email);
                        labyrinth = multiplayer_games[game_code].getLabyrinth();
                        return res.send({status: true, msg: "ok", labyrinth: labyrinth});
                    }else{
                        console.log("[joinGame] Wrong code");
                        return res.send({status: false, msg: "Wrong code"});
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
    token = req.body.token;
    try{
        console.log(`token=${token}`);
        const decode = jwt.verify(token, KEY);
        email = decode.email;
        game_code = req.body.game_code;
        console.log(`game_code=${game_code}`);
        console.log(`email=${email}`);
        game = multiplayer_games[game_code];
        x = req.body.x;
        y = req.body.y;
        console.log(`x=${x}, y=${y}`);
        if(email == game.getPlayer1()){
            game.setLastAcces();
            if(game.isPlayer2Win){
                return res.send({status: true, win: true});
            }
            game.setPlayer1Position(x,y);
            coord = game.getPlayer2Coord();
            return res.send({status: true, x : coord.x, y : coord.y, win : false });
        }else if(email == game.getPlayer2()){
            if(game.isPlayer1Win){
                return res.send({status: true, win: true});
            }
            game.setPlayer2Position(x,y);
            coord = game.getPlayer1Coord();
            return res.send({status: true, x : coord.x, y : coord.y, win : false  });
        }else{
            console.log("[handleMultiplayerGame] email error");
            return res.send({status: false, msg:"error"});
        }
    }catch(error) {
        console.log(error.toString());
        return res.send({status: false, msg:"error"});
    }
}

function deleteGame(req, res, client){
    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        email = decode.email;
        client.query('SELECT * FROM Players WHERE email = $1', [email])
            .then(result => {
                if(result.length != 0) {
                    game_code = req.body.game_code;
                    game = multiplayer_games[game_code];
                    if(game == undefined){
                        console.log("[deleteGame] wrong code");
                        return res.send({status: false, msg:"error"});
                    }
                    if(game.getPlayer1() == email){
                        game_codes.splice(game_codes.indexOf(game_code), 1);
                        delete multiplayer_games[game_code];
                        console.log(`[deleteGame] Deleting game with code ${game_code}`); 
                    }else{
                        console.log(`[deleteGame] ${email} is trying to delete a game that doesn't own`);
                        return res.send({status: false, msg:"error"});
                    }
                }else{
                    console.log("[deleteGame] Player not found");
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

function deleteFinishedGame(req, res, client){
    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        email = decode.email;
        client.query('SELECT * FROM Players WHERE email = $1', [email])
            .then(result => {
                if(result.length != 0) {
                    game_code = req.body.game_code;
                    game = multiplayer_games[game_code];
                    if(game == undefined){
                        console.log("[deleteFinishedGame] wrong code");
                        return res.send({status: false, msg:"error"});
                    }
                    if(game.isPlayer1Win == true || game.isPlayer2Win == true){
                        game_codes.splice(game_codes.indexOf(game_code), 1);
                        delete multiplayer_games[game_code];
                        console.log(`[deleteFinishedGame] Deleting game with code ${game_code}`); 
                    }else{
                        console.log(`[deleteFinishedGame] ${email} is trying to delete a game that hasn't finished yet`);
                        return res.send({status: false, msg:"error"});
                    }
                }else{
                    console.log("[deleteFinishedGame] Player not found");
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

function winningGame(req, res, client){
    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        email = decode.email;
        game_code = req.body.game_code;
        game = multiplayer_games[game_code];
        if(email == game.getPlayer1()){
            winner = email
            loser = game.getPlayer2()
            game.player1Win();
        }else if(email == game.getPlayer2()){
            winner = game.getPlayer2()
            loser = email
        }else{
            return res.send({status: false, msg:"error"});
        }
            
        client.query('UPDATE Players SET wins = wins+1, \
                    total_games = total_games+1, \
                    score = score+10 WHERE email = $1', [winner])
        .then(result => {
            console.log(`[winningGame] ${winner} won the game, wins, score and total_games updated`);
        })
        .catch(err => {
            console.log(err.toString());
            return res.send({status: false, msg:"error"});
        })
        client.query('SELECT score FROM Players WHERE email=$1', [loser])
        .then(result => {
            if(result.rows[0].score >= 5){
                client.query('UPDATE Players SET total_games = total_games+1, \
                    score = score-5 WHERE email = $1', [loser])
                .then(result => {
                    console.log(`[winningGame] ${loser} lost the game, score and total_games updated`);
                })
            }else{
                client.query('UPDATE Players SET total_games = total_games+1 \
                            WHERE email = $1', [loser])
                .then(result => {
                    console.log(`[winningGame] ${loser} lost the game, score and total_games updated`);
                })                  
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

function checkForLeftGames(){
    Object.keys(multiplayer_games).forEach(function(game_code) {
        var seconds = (Date.now() - multiplayer_games[game_code].getLastAccess()) / 1000;
        if(seconds >= 20){
            game_codes.splice(game_codes.indexOf(game_code), 1);
            delete multiplayer_games[game_code];
            console.log(`[checkForLeftGames] Deleting game with code ${game_code}`);
        }
    })
    
}

module.exports = {
    createMultiplayerGame, 
    handleMultiplayerGame,
    checkForPlayer2,
    joinGame,
    deleteGame,
    deleteFinishedGame,
    winningGame,
    checkForLeftGames
}
