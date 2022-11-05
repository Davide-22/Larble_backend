const expr = require('express');
const f = require('./functions');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const app = expr();

app.get('/', function (req, res) {
    return res.send("Hi");
 });

app.post('/login',jsonParser, function (req, res) {
    f.login(req,res);
});

app.post('/signup',jsonParser, function (req, res) {
    f.signup(req,res);
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server Up And Running At Port ${PORT}`);
});