const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const productSchema = mongoose.Schema({

    productName: {
        type: String,
        require: true,
        unique: true
    },
    description: {
        type: String,
        require: true
    },
    images: {
        type: Array,
    },
    category: {
        type: ObjectId,
        ref: "Category",
        require: true
    },
    price: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    quantity: {
        type: Number,
        require: true,
    },
    list: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Products', productSchema);