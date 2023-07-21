const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phone: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    is_admin: {
        type: Number,
        require: true
    },
    status: {
        type: Boolean,
        default: true
    },
    is_verified: {
        type: Number,
        default: 0
    },
})

module.exports = mongoose.model('Users', userSchema);