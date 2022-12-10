const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config();

KEY = process.env.PLAYERS_KEY

function login(req,res,client){
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
                    const token = jwt.sign(data, KEY);
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

function signup(req,res,client){
    console.log("POST /signup " + req.body.email);
    password = req.body.password;
    username = req.body.username;
    email = req.body.email;
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    client.query('INSERT INTO Players(email, password, username, wins, total_games, score) VALUES ($1, $2, $3, $4, $5, $6)',
                  [email, hash, username, 0, 0, 0])
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

function verify(req,res,client){
    console.log("POST /verify ");
    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        email = decode.email;
        client.query('SELECT * FROM Players WHERE email = $1', [email])
            .then(result => {
                if(result.rows.length > 0) return res.send({status: true, msg: "ok"});
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

function changePassword(req, res, client) {
    console.log("POST /change_password");
    oldpassword = req.body.oldpassword;
    password = req.body.password;
    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        const email = decode.email;
        const sha256 = crypto.createHash('sha256');
        const hash = sha256.update(password).digest('base64');
        const sha256_2 = crypto.createHash('sha256');
        const hash2 = sha256_2.update(oldpassword).digest('base64');
        client.query('SELECT password FROM Players WHERE email = $1', [email])
            .then(result => {
                if(result.rows[0].password == hash2){
                    client.query('UPDATE Players SET password=$1 WHERE email=$2', [hash,email])
                    .then(result1 => {
                        return res.send({status: true, msg: "ok"});
                    })
                    .catch(err1 => {
                        console.log(err1.toString());
                        return res.send({status: false, msg:"error"});    
                    })
                }else{
                    return res.send({status: false, msg:"wrong password"});
                }
            })
            .catch(err => {
                console.log(err.toString());
                return res.send({status: false, msg:"error"});    
            })

    }catch(error){
        console.log(error.toString());
        return res.send({status: false, msg:"error"});
    }
}

function changeUsername(req, res, client) {
    console.log("POST /change_username");
    username = req.body.username;
    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        const email = decode.email;
        client.query('UPDATE Players SET username=$1 WHERE email=$2', [username,email])
            .then(result1 => {
                return res.send({status: true, msg: "ok"});
            })
            .catch(err1 => {
                console.log(err1.toString());
                return res.send({status: false, msg:"error"});    
            })

    }catch(error){
        console.log(error.toString());
        return res.send({status: false, msg:"error"});
    }
}

function changeProfilePicture(req, res, client){
    console.log("POST /change_profile_picture");
    profile_picture = req.body.profile_picture;
    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        const email = decode.email;
        client.query('UPDATE Players SET profile_picture=$1 WHERE email=$2', [profile_picture,email])
            .then(result1 => {
                return res.send({status: true, msg: "ok"});
            })
            .catch(err1 => {
                console.log(err1.toString());
                return res.send({status: false, msg:"error"});    
            })
    }catch(error){
        console.log(error.toString());
        return res.send({status: false, msg:"error"});
    }
}

function playerInfo(req, res, client){
    console.log("POST /playerInfo ");
    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        email = decode.email;
        client.query('SELECT * FROM Players WHERE email = $1', [email])
            .then(result => {
                if(result.rows.length > 0){
                    return res.send({
                        status : true,
                        email: email,
                        wins: result.rows[0].wins, 
                        total_games: result.rows[0].total_games,
                        score: result.rows[0].score,
                        profile_picture: result.rows[0].profile_picture
                    });
                } 
                else res.send({status: false, msg: "user not found"});
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

function getLeaderboard(req, res, client){
    console.log("POST /getLeaderboard ");
    token = req.body.token;
    try{
        const decode = jwt.verify(token, KEY);
        email = decode.email;
        client.query('SELECT username, score, wins FROM Players ORDER BY score DESC LIMIT 15', [])
            .then(result => {
                return res.send({
                    status : true,
                    scoreboard : result.rows
                });
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

module.exports = {
    login, 
    signup,
    verify,
    changePassword,
    changeUsername,
    changeProfilePicture,
    playerInfo,
    getLeaderboard
}

