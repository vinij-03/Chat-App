const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {type : mongoose.Schema.Types.ObjectId, ref: 'User'},
    receiver: {type : mongoose.Schema.Types.ObjectId, ref: 'User'},
    test: String,
    
},{timestamps: true});

const MessageModel = mongoose.model('Message', messageSchema);

module.exports = MessageModel;