const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let postSchema = new Schema({
    post_id: String,
    author: String,
    topic: String,
    title: String,
    content: String,
    time: String
})

module.exports = mongoose.model("posts", postSchema);