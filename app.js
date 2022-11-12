const expr = require('express');
const f = require('./app_functions');
const multiplayer = require('./multiplayer_functions');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { Client } = require('pg');
const dotenv = require("dotenv");

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

const app = expr();

app.get('/', function (req, res) {
    return res.send("Hi");
 });

app.post('/login',jsonParser, function (req, res) {
    f.login(req, res, client);
});

app.post('/signup',jsonParser, function (req, res) {
    f.signup(req, res, client);
});

app.post('/verify',jsonParser, function(req,res) {
    f.verify(req, res, client);
})

app.post('/create_multiplayer_game',jsonParser, function(req,res) {
    multiplayer.createMultiplayerGame(req, res, client);
})

let PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server Up And Running At Port ${PORT}`);
});