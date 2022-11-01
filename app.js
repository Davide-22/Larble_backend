const expr = require('express');

const app = expr();

app.get('/', function (req, res) {
    console.log(req);
    return res.send("Hi");
 });

app.get('/login', function (req, res) {
    console.log(req);
    return res.send("Get login");
 });

app.post('/login', function (req, res) {
   console.log(req);
   return res.send("Post login");
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server Up And Running At Port ${PORT}`);
});