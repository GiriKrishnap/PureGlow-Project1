const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({

    name: {
        type: String,
        require: true,
        unique: true,
        uppercase: true,
    },
    expiry: {
        type: Date,
        require: true,
    },
    discount: {
        type: Number,
        require: true,
    },
    minPrice: {
        type: Number,
    },
    maxPrice: {
        type: Number,
    },
    status: {
        type: Boolean,
        default: true,
    }
});

module.exports = mongoose.model('Coupon', couponSchema);