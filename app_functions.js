const crypto = require('crypto');


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

function signup(req,res,client){
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

function verify(req,res,client){
    console.log("POST /verify ");
    token = req.body.token;
    try{
        const decode = jwt.verify(token, 'testkey');
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


module.exports = {
    login, 
    signup,
    verify
}

