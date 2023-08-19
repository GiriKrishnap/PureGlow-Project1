////////////////////////////////////////////////////////////////////////////////////////////////
const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');
////////////////////////////////////////////////////////////////////////////////////////////////
const addToWishlist = async (req, res) => {
    try {

        const userId = req.session.userId
        if (userId) {
            const productId = req.query.id;
            const exist = await Wishlist.findOne({ user_id: userId });
            if (exist) {
                const productsExist = exist.products.find((data) => data.product_id.toString() === productId);
                if (!productsExist) {
                    const updateWishlist = await Wishlist.updateOne({ user_id: userId }, { $push: { products: { product_id: productId } } }).then(() => {
                        res.json({ status: true });
                    })
                } else {
                    const removeWishlist = await Wishlist.updateOne({ user_id: userId }, { $pull: { products: { product_id: productId } } }).then(() => {
                        res.json({ status: false });
                    })
                }
            } else {
                const product = {
                    product_id: productId,
                }

                const saveWishlist = new Wishlist({
                    products: [product],
                    user_id: userId
                })
                await saveWishlist.save().then(() => {
                    res.json({ status: true });
                })
            }
        } else {
            res.redirect('/home');
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////
const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.userId
        if (userId) {
            const wishlistData = await Wishlist.findOne({ user_id: userId }).populate('products.product_id');
            const userName = req.session.userName;
            res.render('wishlist', { wishlistData, userName });
        } else {
            res.redirect('/login');
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    addToWishlist,
    loadWishlist,
}