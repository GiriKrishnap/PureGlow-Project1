const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');


const orderSchema = new mongoose.Schema({
    products: [{
        product_id: {
            type: ObjectId,
            ref: 'Products'
        },
        quantity: {
            type: Number
        },
        price: {
            type: Number
        },
        totalPrice: {
            type: Number
        },
    }],
    user_id: {
        type: ObjectId,
        ref: 'Users'
    },
    address_id: {
        type: ObjectId,
        ref: 'Address'
    },
    quantity: {
        type: Number,
    },
    totalPrice: {
        type: Number,
    },
    orderDate: {
        type: Date,
    },
    deliveryDate: {
        type: Date,
    },
    paymentMethod: {
        type: String,
    },
    paymentStatus: {
        type: String,
    },
    status: {
        type: String,
    },
});

module.exports = mongoose.model('Order', orderSchema);