const { Client } = require('pg');
const dotenv = require("dotenv");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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


module.exports = {init_db, login, signup}

