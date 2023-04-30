const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');


const login = express();
login.use(express.json());

const port = (process.env.PORT);

const database = "mongodb://localhost:27017/login";
mongoose.connect(database);
mongoose.Promise = Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Database connection error!"));


login.post("/login", (req, res) => {
    console.log(req.body.username);
    User.findOne({username: req.body.username}).then((user) =>{
        if(!user) {
            return res.status(403).json({message: "User not found!"});
        } else {
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if(err) throw err;
                if(isMatch) {
                    const jwtPayload = {
                        id: user._id,
                        username: user.username
                    }
                    jwt.sign(
                        jwtPayload,
                        process.env.SECRET,
                        {
                            expiresIn: "7d"
                        },
                        (err, token) => {
                            if (err) console.log(err);
                            res.cookie('jwt', token, {sameSite: 'strict'});
                            res.json({cookie: 'token send to cookie'});
                        }
                    )
                } else {
                    res.json({success: false, message: "username or password incorrect"});
                }
            })
        }
    })
})

login.post("/register", (req, res) => {
    console.log(req.body.username);
    User.findOne({username: req.body.username}).then((user) => {
        if (user) {
            return res.json({message: "Username already taken."});
        } else {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) throw err;
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) throw err;
                    User.create(
                        {
                            username: req.body.username,
                            password: hash
                        }
                    )
                    console.log("New user created");
                    res.redirect(307, "/login");
                })
            })
        }
    })
})

login.post("/password", (req, res) => {
    console.log("password");
    User.findOne({username: req.body.username}).then((user) =>{
        if(!user) {
            return res.status(403).json({message: "User not found!"});
        } else {
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if(err) throw err;
                if(isMatch) {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) throw err;
                        bcrypt.hash(req.body.newpassword, salt, (err, hash) => {
                            if (err) throw err;
                            else {
                                User.findByIdAndUpdate(user._id, 
                                    {password: hash}
                                ).then(() => {
                                    console.log("Password changed");
                                    res.json({message: "password changed"});
                                }
                                );
                            }
                        })
                    })
                } else {
                    res.json({success: false, message: "username or password incorrect"});
                }
            })
        }
    })
})

login.listen(port, () => {
    console.log(port);
})