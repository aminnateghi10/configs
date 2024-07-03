const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("mongoose-timestamp");

const testUsers = new Schema({
    user_id: {type: Number, required: true},
});

testUsers.plugin(timestamp);

module.exports = mongoose.model('testUsers',testUsers);
