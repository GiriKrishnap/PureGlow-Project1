//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Users = require('../models/userModels');
const Products = require('../models/productModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Wallet = require('../models/walletModel');
//---------------------------------------------------------
const Razorpay = require('razorpay');
require('dotenv/config');
var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});
///////////// U-S-E-R--S-I-D-E ///////////////////////////////////////////////////////////////////////////////////////////////
const loadCheckout = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const userId = req.session.userId;
            const address = await Address.find({ user_id: userId, list: true });
            const cartData = await Cart.findOne({ user_id: userId }).populate('products.product_id');
            const carts = await Cart.findOne({ user_id: userId });
            const couponData = await Coupon.findOne({ _id: carts.couponId });
            const availableCoupon = await Coupon.find({ status: true });

            const subTotalPrice = carts ? carts.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
            if (couponData) {
                res.render('checkout', { address, cartData, subTotalPrice, userId, couponData });
                await Coupon.updateOne({ _id: carts.couponId }, { $set: { status: false } });
            } else {
                res.render('checkout', { address, cartData, subTotalPrice, userId, couponData: null, availableCoupon });
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
                    const orderPrice = req.body.totalPrice;
                    const paymentMethod = req.body.selector;

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
                            totalPrice: orderPrice,
                            orderDate: recentDate,
                            deliveryDate: deliveredDate,
                            paymentMethod: paymentMethod,
                            paymentStatus: 'pending',
                            status: 'pending',
                        });
                        await orderSave.save().then(async (response) => {
                            const orderId = response._id;

                            if (paymentMethod === "COD") {
                                //----CASH_ON_DELIVERY---------
                                await Order.updateOne({ _id: orderId, user_id: userId }, { $set: { status: 'success' } });
                                res.json({ codSuccess: true });
                                cartData.products.forEach(async (data) => {
                                    await Products.updateOne({ _id: data.product_id }, { $inc: { quantity: - data.quantity } });
                                })
                                await Cart.deleteOne({ user_id: userId });

                            } else if (paymentMethod === "wallet") {
                                //------WALLET-------------
                                const walletAmount = await Wallet.findOne({ user_id: userId });

                                if (walletAmount.amount < orderPrice) {
                                    res.json({ msg: 'wallet amount is less for this purchase' });

                                } else {
                                    await Order.updateOne({ _id: orderId, user_id: userId }, { $set: { status: 'success', paymentStatus: "paid" } })
                                    res.json({ codSuccess: true });
                                    await Wallet.updateOne({ user_id: userId }, { $inc: { amount: - orderPrice } })
                                    cartData.products.forEach(async (data) => {
                                        await Products.updateOne({ _id: data.product_id }, { $inc: { quantity: - data.quantity } });
                                    })
                                    await Cart.deleteOne({ user_id: userId });
                                }
                            } else if (paymentMethod === 'Razorpay') {
                                //----------RAZORPAY------------------
                                await generateRazorpay(orderId, orderPrice).then((response) => {
                                    res.json({ response, orderId });
                                })
                            }
                        })
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
//----------------------------------------
const generateRazorpay = async (orderId, orderPrice) => {
    try {
        const amount = orderPrice * 100; // amount in paisa
        const currency = 'INR';
        const options = {
            amount: amount,
            currency: currency,
            receipt: orderId,
        };
        const response = await instance.orders.create(options);

        return response;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
};
//------------------------------------------------------

const verifyPayment = async (req, res) => {
    try {
        const order = req.body.order;
        const userId = req.session.userId;
        const user = req.session.isLoggedIn;
        const orderId2 = req.body.orderId
        const paymentId = req.body.paymentId
        const razorpay_signature = req.body.razorpay_signature
        const ORDERID = req.body.ORDERID
        if (user) {
            checkPayment(orderId2, paymentId, razorpay_signature).then(async () => {

                await Order.updateOne({ user_id: userId, _id: ORDERID }, { $set: { status: 'success', paymentStatus: 'paid' } })
                const order = await Order.findOne({ user_id: userId, _id: ORDERID });
                order.products.forEach(async (data) => {
                    await Products.updateOne({ _id: data.product_id }, { $inc: { quantity: - data.quantity } });
                })
                res.json({ status: true })
                await Cart.deleteOne({ user_id: userId });

            }).catch((error) => {
                console.log(error.message);
                res.json({ status: false, errMsg: '' })
            })
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};
//--------------------------------------------------
const checkPayment = (orderId, paymentId, razorpay_signature) => {

    return new Promise((resolve, reject) => {

        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'mO9uCY5olfBQmpjGI4ReV4wE');
        hmac.update(orderId + '|' + paymentId);
        hmac = hmac.digest('hex');
        if (hmac === razorpay_signature) {
            resolve()
        } else {
            reject();

        }
    })
}
//--------------------------------------------------------------------------------------------------------------------------
const cancelOrder = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        if (user) {
            const id = req.query.id;
            const date = new Date();
            await Order.updateOne({ _id: id }, { $set: { status: 'cancelled', deliveryDate: date } });
            const orderData = await Order.findOne({ _id: id })
            if (orderData.paymentMethod == "Razorpay" || orderData.paymentMethod == "wallet") {
                const WalletData = await Wallet.findOne({ user_id: orderData.user_id });

                if (!WalletData) {
                    const wallet = new Wallet({
                        amount: orderData.totalPrice,
                        user_id: orderData.user_id
                    })
                    await wallet.save();

                } else {
                    await Wallet.updateOne({ user_id: orderData.user_id }, { $inc: { amount: orderData.totalPrice } });
                }
            }
            orderData.products.forEach(async (data) => {
                await Products.updateOne({ _id: data.product_id }, { $inc: { quantity: data.quantity }, $set: { list: true } });
            })
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
        const successOrders = (await Order.find().populate('address_id').populate('products.product_id')).reverse()
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
    verifyPayment,
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////