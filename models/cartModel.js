const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    products: [{
        product_id: {
            type: ObjectId,
            ref: 'Products'
        },
        quantity: {
            type: Number,
        },
        price: {
            type: Number,

        },
        totalPrice: {
            type: Number,
        },
    }],
    user_id: {
        type: ObjectId,
        ref: 'Users'
    },
    couponId: {
        type: ObjectId,
        ref: 'Coupon',
    }
})

module.exports = mongoose.model('cart', cartSchema);