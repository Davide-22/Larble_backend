const { Client } = require('pg');
const dotenv = require("dotenv");
const crypto = require('crypto');

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
    client.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, hash])
            .then(result => {
                if(result.length > 0){
                    const d = new Date();
                    let data = {
                        email: email,
                        time: d.toUTCString()
                    }
                    const token = jwt.sign(data, "testkey");
                    res.send({status: true, msg: token});
                }else{
                    return res.send({status: false, msg:"wrong email or password"});
                }
            })
            .catch(err => {
                console.log(err.toString());
                return res.send({status: false, msg:"error"});
                
            })
}

module.exports = {init_db, login}

