////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const Users = require('../models/userModels');
const Products = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupons = require('../models/couponModel');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const addToCart = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const productId = req.query.id;
            const userId = req.session.userId;
            const userData = await Users.findOne({ _id: userId });
            const cartData = await Cart.findOne({ user_id: userId });
            const productData = await Products.findOne({ _id: productId });
            const salePrice = Math.round(productData.price - (productData.price * productData.discount) / 100)

            const product = {
                product_id: productId,
                quantity: 1,
                price: salePrice,
                totalPrice: salePrice,
            }
            if (userData.status === true) {
                if (cartData) {

                    const checkExist = cartData.products.filter((value) => value.product_id.toString() === productId);
                    if (checkExist.length !== 0) {
                        await Cart.findOneAndUpdate({ user_id: userId, "products.product_id": productId }, { $inc: { "products.$.quantity": 1, "products.$.totalPrice": salePrice } });
                        res.redirect('/cart');

                    } else {

                        await Cart.updateOne({ user_id: userId }, { $push: { products: { product_id: productId, quantity: 1, price: salePrice, totalPrice: salePrice } } })
                        res.redirect('/cart');
                    }
                } else {

                    const saveCart = new Cart({
                        products: [product],
                        user_id: userId
                    })

                    await saveCart.save();
                    res.redirect('/cart');
                }
            } else {
                res.redirect('/login');
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const loadCart = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        if (user) {
            const userId = req.session.userId
            const userName = req.session.userName;
            const cartData = await Cart.findOne({ user_id: userId }).populate('products.product_id');
            
            if (cartData) {
                const carts = await Cart.findOne({ user_id: userId });
                const subTotalPrice = carts ? carts.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;

                res.render('cart', { cartData, subTotalPrice, userName });
            } else {
                res.render('cart', { cartData: '', subTotalPrice: ' ', userName });
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const removeProduct = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const productId = req.query.id;
            const userId = req.session.userId;
            const cartData = await Cart.findOne({ user_id: userId });
            if (cartData) {
                const product = cartData.products.find((p) => p.product_id.toString() === productId);
                await Cart.updateOne({ user_id: userId, 'products._id': productId }, { $pull: { products: { _id: productId } } }).then(() => {
                    res.redirect('/cart');
                })
            } else {
                res.redirect('/cart');
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const incrementQuantity = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const productId = req.query.id;
            const cartQuantity = (parseInt(req.body.quantity) + 1);
            const userId = req.session.userId;
            const cartData = await Cart.findOne({ user_id: userId });
            const productData = await Products.findOne({ _id: productId });
            const salePrice = Math.round(productData.price - (productData.price * productData.discount) / 100)

            if (cartData && cartQuantity <= productData.quantity) {
                await Cart.findOneAndUpdate({ user_id: userId, "products.product_id": productId }, { $inc: { "products.$.quantity": 1, "products.$.totalPrice": salePrice } });
                res.json({ status: true })
            } else {
                res.json({ status: false, message: 'Maximum Quantity Reached' });
            }

        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}

const decrementQuantity = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const productId = req.query.id;
            const cartQuantity = (req.body.quantity);
            const userId = req.session.userId;
            const cartData = await Cart.findOne({ user_id: userId });
            const productData = await Products.findOne({ _id: productId });
            const salePrice = Math.round(productData.price - (productData.price * productData.discount) / 100)

            if (cartData && cartQuantity > 1) {

                await Cart.findOneAndUpdate({ user_id: userId, "products.product_id": productId }, { $inc: { "products.$.quantity": -1, "products.$.totalPrice": -salePrice } });
                res.json({ status: true })
            } else {
                res.json({ status: false, message: 'Minimum Quantity Reached' });
            }
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
module.exports = {
    loadCart,
    addToCart,
    removeProduct,
    incrementQuantity,
    decrementQuantity,

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////