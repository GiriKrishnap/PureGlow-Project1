//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Users = require('../models/userModels');
const Products = require('../models/productModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
///////////// U-S-E-R--S-I-D-E ///////////////////////////////////////////////////////////////////////////////////////////////
const loadCheckout = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const userId = req.session.userId;
            const address = await Address.find({ user_id: userId, list: true });
            const cartData = await Cart.findOne({ user_id: userId }).populate('products.product_id');
            const carts = await Cart.findOne({ user_id: userId });
            const couponData = await Coupon.findOne({ _id: carts.couponId });

            const subTotalPrice = carts ? carts.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
            if (couponData) {
                res.render('checkout', { address, cartData, subTotalPrice, userId, couponData });
                await Coupon.updateOne({ _id: carts.couponId }, { $set: { status: false } });
            } else {
                res.render('checkout', { address, cartData, subTotalPrice, userId, couponData: null });
            }

        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//--------------------------------------------------------------------------------------------------------------------------
const placedOrder = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const userId = req.session.userId;
            if (!req.body.flexRadioDefault || !req.body.selector) {
                res.redirect('/checkout')
            } else {
                const cartData = await Cart.findOne({ user_id: userId }).populate('products.product_id');
                if (cartData) {
                    const cartOrders = cartData.products
                    const totalQuantity = cartData ? cartData.products.reduce((acc, cur) => acc + cur.quantity, 0) : 0;

                    const days = 7;
                    const newDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                    const recentDate = new Date();
                    const deliveredDate = newDate;
                    if (cartOrders) {
                        const orderSave = new Order({
                            products: cartData.products,
                            user_id: userId,
                            address_id: req.body.flexRadioDefault,
                            quantity: totalQuantity,
                            totalPrice: req.body.totalPrice,
                            orderDate: recentDate,
                            deliveryDate: deliveredDate,
                            paymentMethod: req.body.selector,
                            orderStatus: '',
                            userStatus: '',
                            paymentStatus: 'pending',
                            status: 'pending',
                        });
                        await orderSave.save()
                        cartData.products.forEach(async (data) => {
                            const product = await Products.updateOne({ _id: data.product_id }, { $inc: { quantity: - data.quantity } });
                            if (product.quantity <= 0) {
                                await Products.updateOne({ _id: product._id }, { $set: { list: false } });
                            }
                        })
                        await Cart.deleteOne({ user_id: userId });

                        res.redirect('/profile');
                    }
                }
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//--------------------------------------------------------------------------------------------------------------------------
const cancelOrder = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        if (user) {
            const id = req.query.id;
            const date = new Date();
            await Order.updateOne({ _id: id }, { $set: { status: 'cancelled', deliveryDate: date } });
            res.redirect('/profile');
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
///////////////////A-D-M-I-N-S-I-D-E///////////////////////////////////////////////////////////////////////////////////////////
const loadOrderManagement = async (req, res) => {
    try {
        const successOrders = await Order.find().populate('address_id').populate('products.product_id');
        res.render('order-management', { successOrders });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//--------------------------------------------------------------------------------------------------------------------------
const orderShipped = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const id = req.body.id;
            const orderData = await Order.findOne({ _id: id })
            if (orderData.status !== 'cancel') {
                const inputStatus = req.body.status
                if (inputStatus === 'Shipping') {
                    await Order.updateOne({ _id: id }, { $set: { status: 'shipping' } }).then((response) => {
                        res.json({ status: true })
                    })
                } else {
                    const date = new Date();
                    await Order.updateOne({ _id: id }, { $set: { status: 'delivered', deliveryDate: date, paymentStatus: 'paid' } }).then((response) => {
                        res.json({ status: false });
                    })
                }
            } else {

            }
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//--------------------------------------------------------------------------------------------------------------------------
const AdminCancelOrder = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const id = req.query.id;
            const date = new Date();
            await Order.updateOne({ _id: id }, { $set: { status: 'cancelled', deliveryDate: date } });
            res.redirect('/admin/order-management');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' });
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    loadCheckout,
    placedOrder,
    loadOrderManagement,
    orderShipped,
    cancelOrder,
    AdminCancelOrder,
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////