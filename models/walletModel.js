const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({

    user_id: {
        type: ObjectId,
        ref: 'Users'
    },
    amount: {
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model('Wallet', walletSchema);