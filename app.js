const expr = require('express');

const app = expr();
const port = 3000;


app.get('/login', function (req, res) {
    console.log(req);
    return res.send("Get login");
 });

app.post('/login', function (req, res) {
   console.log(req);
   return res.send("Post login");
});

app.listen(port, () => {
    console.log('Listening on port: ' + port);
})