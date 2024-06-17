const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamp = require("mongoose-timestamp");
const AdminSchema = new Schema({
    name: {type: String, required: true},
    user_name: {type: String, required: true},
    password: {type: String, required: true},
});

AdminSchema.plugin(timestamp);

module.exports = mongoose.model('admin',AdminSchema);
