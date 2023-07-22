//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Users = require('../models/userModels');
const Products = require('../models/productModel');
const Cart = require('../models/cartModel');
const Address = require('../models/addressModel');
const Order = require('../models/orderModel');
///////////// U-S-E-R--S-I-D-E ///////////////////////////////////////////////////////////////////////////////////////////////
const loadCheckout = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const userId = req.session.userId;
            const address = await Address.find({ user_id: userId, list: true });
            console.log(address + 'address is here');
            const cartData = await Cart.findOne({ user_id: userId }).populate('products.product_id');
            const carts = await Cart.findOne({ user_id: userId });
            const subTotalPrice = carts ? carts.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
            res.render('checkout', { address, cartData, subTotalPrice, userId });

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
                    const subTotalPrice = cartData ? cartData.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
                    const totalQuantity = cartData ? cartData.products.reduce((acc, cur) => acc + cur.quantity, 0) : 0;

                    const days = 7;
                    const newDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                    const recentDate = new Date();
                    const deliveredDate = newDate;
                    if (req.body.subTotalPrice) {
                        subTotalPrice = req.body.subTotalPrice;
                    };
                    if (cartOrders) {
                        const orderSave = new Order({
                            products: cartData.products,
                            user_id: userId,
                            address_id: req.body.flexRadioDefault,
                            quantity: totalQuantity,
                            totalPrice: subTotalPrice,
                            orderDate: recentDate,
                            deliveryDate: deliveredDate,
                            paymentMethod: req.body.selector,
                            orderStatus: '',
                            userStatus: '',
                            paymentStatus: 'pending',
                            status: 'pending',
                        });
                        await orderSave.save()
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
        res.render('error');
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
///////////////////A-D-M-I-N-S-I-D-E///////////////////////////////////////////////////////////////////////////////////////////
const loadOrderManagement = async (req, res) => {
    try {
        const successOrders = await Order.find().populate('address_id').populate('products.product_id');
        console.log(successOrders.products);
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
        res.status(500).json({ error: true, message: 'internal sever error' })
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