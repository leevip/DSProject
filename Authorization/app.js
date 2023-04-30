const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
let port = (process.env.PORT);

/*This is simply for pinging the service*/
app.get('/', (req, res) => {
    res.json({message: "Hello World!"})
})

app.get('/auth', (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if(authHeader) {
        jwt.verify(authHeader, process.env.SECRET, (err, content) =>{
            if(err) res.sendStatus(403);
            if(content) {
                console.log(content);
                res.json({user: content.username});
            }
        })
    }
})

app.listen(port, () => {
    console.log(port)
})