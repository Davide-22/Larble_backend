const { Client } = require('pg');
const dotenv = require("dotenv");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
//import {MultiplayerGame} from './multiplayer_game.js';

dotenv.config();
const client = init_db();
client.connect();

function init_db(){
    const connectionString = process.env.DATABASE_URL;
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    return client;
}

function login(req,res){
    console.log("POST /login " + req.body.email);
    email = req.body.email;
    password = req.body.password;
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    client.query('SELECT * FROM Players WHERE email = $1 AND password = $2', [email, hash])
            .then(result => {
                console.log(result.rows);
                if(result.rows.length > 0){
                    const d = new Date();
                    let data = {
                        email: email,
                        time: d.toUTCString()
                    }
                    const token = jwt.sign(data, "testkey");
                    res.send({status: true, msg: token, username: result.rows[0].username});
                }else{
                    return res.send({status: false, msg:"wrong email or password"});
                }
            })
            .catch(err => {
                console.log(err.toString());
                return res.send({status: false, msg:"error"});
                
            })
}

function signup(req,res){
    console.log("POST /signup " + req.body.email);
    password = req.body.password;
    username = req.body.username;
    email = req.body.email;
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    client.query('INSERT INTO Players(email, password, username) VALUES ($1, $2, $3)', [email, hash, username])
            .then(result => {
                res.send({status: true, msg:"ok"});
            })
            .catch(err => {
                console.log(err.toString());
                if(err.code == '23505'){
                    return res.send({status: false, msg:"user already exists"});
                }else{
                    return res.send({status: false, msg:"error"});
                }      
            })
}

function verify(req,res){
    console.log("POST /verify ");
    token = req.body.token;
    try{
        const decode = jwt.verify(token, 'testkey');
        email = decode.email;
        db.query('SELECT * FROM users WHERE email = $1', [email])
            .then(result => {
                if(result.length > 0) return res.send({status: true, msg: "ok"});
                else res.send({status: false, msg: "email not in database"});
            })
            .catch(err => {
                console.log(err.toString());
                return res.send({status: false, msg: "error"});
            })
    }catch(error) {
        console.log(error.toString());
        return res.send({status: false, msg:"error"});
    }
}

var game_codes = []
var multiplayer_games = {}

function createMultiplayerGame(req, res){

    token = req.body.token;
    try{
        const decode = jwt.verify(token, 'testkey');
        email = decode.email;
        db.query('SELECT * FROM users WHERE email = $1', [email])
            .then(result => {
                if(result.length == 0) return;
            })
            .catch(err => {
                console.log(err.toString());
                return
            })
    }catch(error) {
        console.log(error.toString());
        return
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
    //const game = new MultiplayerGame(email, null);
    multiplayer_games['game_code'] = game;
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

module.exports = {login, 
                  signup,
                  verify,
                  createMultiplayerGame, 
                  handleMultiplayerGame,
                  checkForPlayer2}

