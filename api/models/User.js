const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {type:String , unique: true},
    email: String,
    password: String,
},{timestamps: true});

const user= mongoose.model("User", UserSchema);
module.exports = user;