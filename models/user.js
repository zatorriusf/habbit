const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true,
        minlength : 8
    },
    lastLogin : {
        type: Date,
        required: false,
        default: null
    }
},{timestamps : true});

module.exports = mongoose.model('User',userSchema);