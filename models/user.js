const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const habbitSchema = require('./habit');

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
    },
    habits : [habbitSchema]
},{timestamps : true});

module.exports = mongoose.model('User',userSchema);