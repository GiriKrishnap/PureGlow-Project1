const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({

    title: {
        type: String,
        require: true,
    },
    image: {
        type: Array,
    },
    description: {
        type: String,
        require: true,
    },
    list: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Banner', bannerSchema);