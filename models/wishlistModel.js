const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({

    products: [{
        product_id: {
            type: ObjectId,
            ref: "Products"
        }
    }],

    user_id: {
        type: ObjectId,
        require: true,
        ref: 'User'
    }
});

module.exports = mongoose.model('Wishlist', wishlistSchema);