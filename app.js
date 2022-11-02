const expr = require('express');
const f = require('./functions');
const { Client } = require('pg');

const app = expr();

app.get('/', function (req, res) {
    return res.send("Hi");
 });

app.post('/login', function (req, res) {
    f.login(req,res);
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server Up And Running At Port ${PORT}`);
});