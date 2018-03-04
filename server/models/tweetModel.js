const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetSchema = new Schema({
  text: String,
  author: String,
  messages: [Schema.Types.ObjectId]
});
const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet; // <-- export your model