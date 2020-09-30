const { Schema } = require('mongoose');

const habitSchema = new Schema({
    title : {
        type : String,
        required: true
    },
    desc : {
        type : String,
        required: true
    },
    frequency : {
        type : String,
        required : true,
        enum : ['daily','weekly','bi-weekly','monthly']
    },
    totalActivity : {
        type: Number,
        required : true,
        default : 0

    },
    lastActivity : {
        type : Date,
        required : () => {
            return this.totalActivity > 0;
        }
    },
    currentStreak : {
        type : Number,
        required : true,
        default : 0
    },
    longestStreak : {
        type : Number,
        required : true,
        default : 0
    }
},{
    timestamps : true
});

module.exports = habitSchema;