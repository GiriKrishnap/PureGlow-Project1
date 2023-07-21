////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const Users = require('../models/userModels');
const Products = require('../models/productModel');
const Cart = require('../models/cartModel');


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const addToCart = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const productId = req.query.id;
            const userId = req.session.userId;
            const userData = await Users.findOne({ _id: userId });
            const cartData = await Cart.findOne({ user_id: userId });
            const productData = await Products.findOne({ _id: productId });
            const salePrice = (productData.price * productData.discount) / 100;

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
                        console.log('there is no product exist here -------');

                        await Cart.updateOne({ user_id: userId }, { $push: { products: { product_id: productId, quantity: 1, price: salePrice, totalPrice: salePrice } } })
                        res.redirect('/cart');
                    }
                } else {
                    console.log('there is no cart exist here --------');

                    const saveCart = new Cart({
                        products: [product],
                        user_id: userId
                    })
                    console.log(saveCart + 'this i saveCart=======');

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
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const loadCart = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        if (user) {
            const userId = req.session.userId
            const cartData = await Cart.findOne({ user_id: userId }).populate('products.product_id');
            if (cartData) {
                const carts = await Cart.findOne({ user_id: userId });
                const subTotalPrice = carts ? carts.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;

                res.render('cart', { cartData, subTotalPrice });
            } else {
                res.render('cart', { cartData, subTotalPrice: ' ' }); console.log('here----');
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
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
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const incrementQuantity = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const productId = req.query.id;
            const cartQuantity = req.query.qt;
            const userId = req.session.userId;
            const cartData = await Cart.findOne({ user_id: userId });
            const productData = await Products.findOne({ _id: productId });
            const salePrice = (productData.price * productData.discount) / 100;

            if (cartData && cartQuantity < productData.quantity) {
                await Cart.findOneAndUpdate({ user_id: userId, "products.product_id": productId }, { $inc: { "products.$.quantity": 1, "products.$.totalPrice": salePrice } });
                res.redirect('/cart');
            } else {
                res.redirect('/cart');
            }

        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

const decrementQuantity = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const productId = req.query.id;
            const cartQuantity = req.query.qt;
            const userId = req.session.userId;
            const cartData = await Cart.findOne({ user_id: userId });
            const productData = await Products.findOne({ _id: productId });
            const salePrice = (productData.price * productData.discount) / 100;

            if (cartData && cartQuantity > 1) {

                await Cart.findOneAndUpdate({ user_id: userId, "products.product_id": productId }, { $inc: { "products.$.quantity": -1, "products.$.totalPrice": -salePrice } });
                res.redirect('/cart');
            } else {
                res.redirect('/cart');
            }
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
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