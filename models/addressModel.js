const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        ref: 'Users'
    },
    name: {
        type: String,
        require: true
    },
    phone: {
        type: Number
    },
    email: {
        type: String,
    },

    address: {
        type: String,
        require: true
    },
    state: {
        type: String,
        require: true
    },
    district: {
        type: String,
        require: true
    },
    city: {
        type: String
    },
    landMark: {
        type: String
    },
    pincode: {
        type: Number,
        require: true
    },
    list: {
        type: Boolean,
        default: true
    }

})

module.exports = mongoose.model('Address', addressSchema);