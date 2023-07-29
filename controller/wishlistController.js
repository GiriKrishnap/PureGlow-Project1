////////////////////////////////////////////////////////////////////////////////////////////////
const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');
////////////////////////////////////////////////////////////////////////////////////////////////
const addToWishlist = async (req, res) => {
    try {

        const userId = req.session.userId
        if (userId) {
            const productId = req.query.id;
            console.log("🚀 productId is here - " + productId);
            const exist = await Wishlist.findOne({ user_id: userId });
            console.log('🚀 Exist is here - ' + exist);
            if (exist) {
                const productsExist = exist.products.find((data) => data.product_id.toString() === productId);
                console.log('🚀 productExist is here - ' + productsExist)
                if (!productsExist) {
                    const updateWishlist = await Wishlist.updateOne({ user_id: userId }, { $push: { products: { product_id: productId } } }).then(() => {
                        res.json({ status: true });
                        console.log('🚀 item ADDED ',)
                    })
                } else {
                    const removeWishlist = await Wishlist.updateOne({ user_id: userId }, { $pull: { products: { product_id: productId } } }).then(() => {
                        res.json({ status: false });
                        console.log('🚀 item is REMOVED')
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
            console.log('🚀 wishlist Data is here ' + wishlistData);
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