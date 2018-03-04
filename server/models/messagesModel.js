const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageModel = new Schema({
  text: String,
  author: String,
  likeCount: {
    type: Number,
    default: 0
  }
});
const Message = mongoose.model('Message', messageModel);

module.exports = Message; // <-- export your model