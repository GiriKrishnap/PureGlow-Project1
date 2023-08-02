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
                    const orderPrice = req.body.totalPrice;
                    const paymentMethod = req.body.selector;
                    console.log("🚀 paymentMethod - " + paymentMethod);
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
                            status: 'success',
                        });
                        await orderSave.save().then(async (response) => {
                            const orderId = response._id;
                            if (paymentMethod === "COD") {
                                console.log("🚀 CASH ON DELIVERY");
                                res.json({ codSuccess: true });
                             
                                cartData.products.forEach(async (data) => {
                                    const product = await Products.updateOne({ _id: data.product_id }, { $inc: { quantity: - data.quantity } });
                                    if (product.quantity <= 0) {
                                        await Products.updateOne({ _id: product._id }, { $set: { list: false } });
                                    }
                                })

                            } else if (paymentMethod === "wallet") {
                                console.log("🚀 Wallet");
                                const walletAmount = await Wallet.findOne({ user_id: userId });
                                if (walletAmount.amount < orderPrice) {
                                    res.json({ msg: 'wallet amount is less for this purchase' });
                                } else {

                                    await Order.updateOne({ _id: orderId, user_id: userId }, { $set: { status: 'success', paymentStatus: "paid" } })
                                    res.json({ codSuccess: true });
                                    await Wallet.updateOne({ user_id: userId }, { $inc: { amount: - orderPrice } })

                                }
                            } else if (paymentMethod === 'Razorpay') {
                                console.log("🚀 Razorpay");
                                await generateRazorpay(orderId, orderPrice).then((response) => {
                                    res.json({ response, orderId });

                                })
                            }
                        }).then(async () => {
                            await Cart.deleteOne({ user_id: userId });
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
        console.log("🚀 orderId2 - " + orderId);
        console.log("🚀 orderPrice - " + orderPrice);
        const amount = orderPrice * 100; // amount in paisa
        const currency = 'INR';

        const options = {
            amount: amount,
            currency: currency,
            receipt: orderId,
        };
        const response = await instance.orders.create(options);
        console.log("🚀2 response.Amount - " + response.amount);
        console.log("🚀2 response.Id - " + response.id);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
//------------------------------------------------------

const verifyPayment = async (req, res) => {
    try {
        const order = req.body.order;
        console.log("🚀 order - " + order)

        const userId = req.session.userId;
        console.log('🚀 userId3 - ' + userId);
        const user = req.session.isLoggedIn;
        const orderId2 = req.body.orderId
        const paymentId = req.body.paymentId
        const razorpay_signature = req.body.razorpay_signature
        const ORDERID = req.body.ORDERID

        if (user) {
            checkPayment(orderId2, paymentId, razorpay_signature).then(async () => {
                console.log("we are here boys 162 🚀🚀")
                const orders = await Order.updateOne({ user_id: userId, _id: ORDERID }, { $set: { status: 'success', paymentStatus: 'paid' } })
                console.log(orders);
                res.json({ status: true })

            }).catch((error) => {
                console.log(error);
                res.json({ status: false, errMsg: '' })
            })

        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
};
//--------------------------------------------------
const checkPayment = (orderId, paymentId, razorpay_signature) => {
    console.log("🚀 orderId 6 - " + orderId);
    console.log("🚀 paymentId 6 - " + paymentId)

    return new Promise((resolve, reject) => {

        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'mO9uCY5olfBQmpjGI4ReV4wE');
        hmac.update(orderId + '|' + paymentId);
        hmac = hmac.digest('hex');
        console.log(`HMC = razorpay_signature ${hmac} === ${razorpay_signature}`)
        if (hmac === razorpay_signature) {
            resolve()
            console.log("🔺🔺🔺🔺🔺🔺🔺🔺🔺")

        } else {
            reject();
            console.log("🚀🚀🚀🚀🚀🚀")

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
    verifyPayment,
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////