const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');
const {v4: uuidv4} = require('uuid');
const http = require('node:http');


const posts = express();
posts.use(express.json());

let port = (process.env.PORT);


const database = "mongodb://localhost:27017/posts";
mongoose.connect(database);
mongoose.Promise = Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Database connection error!"));


posts.get('/', (req, res) => {
    console.log(req.body.topic);

    Post.find({topic: req.body.topic}).then((result) => {
        console.log(result);
        res.json(result);
    })
})

posts.post('/', (req, res) => {
    let authToken = req.headers["authorization"];
    let options = {
        host: 'localhost',
        port: '3001',
        path: '/auth',
        method: 'GET',
        headers: {
            'Authorization': authToken
        }
    }
    let request = http.request(options, (response) => {
        if (response.statusCode == 403) {
            res.json({error: "Authorization error"})
        }
        else {
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                let jsonObj = JSON.parse(chunk);
                console.log(jsonObj.user);
                console.log(req.body.author);
                if (jsonObj.user === req.body.author){
                    console.log("Creating post");
                    Post.create(
                        {
                            post_id: uuidv4(),
                            author: req.body.author,
                            topic: req.body.topic,
                            title: req.body.title,
                            content: req.body.content,
                            time: Date.now()
                        }
                    ).catch((err) => {
                        if (err) {
                            throw err;
                        }
                    })
                    res.json({message: "Post uploaded"});
                }
                else {
                    res.json({error: "Authorization failed!"});
                }
            });
            response.on('end', () => {
                console.log("Authorization response ended.");
            });
        }
    })
    request.on('error', (err) => {
        console.log(err);
        res.json({error: "Something went wrong!"});
    })
    request.end();
    
})

posts.listen(port, () => {
    console.log(port)
})