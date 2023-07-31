////////////////////////////////////////////////////////////////////////////////////////////////
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel')
////////////////////////////////////////////////////////////////////////////////////////////////
const loadCreateCouponPage = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const couponData = await Coupon.find();
            const usedCouponData = await Coupon.find({ status: false })
            res.render('coupon', { admin, couponData, usedCouponData });
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.render('error');
    }
}
// insertCoupons -------------------------------------------------------------------------------
const insertCoupon = async (req, res) => {
    try {
        const { couponCodeName, discount, expireDate, minPrice, maxPrice } = req.body;
        const exist = await Coupon.findOne({ name: couponCodeName });
        if (!couponCodeName || !discount || !expireDate || discount < 0 || maxPrice < 0 || minPrice < 0) {
            res.json({ status: false, message: 'please fill the fields!' });

        } else if (couponCodeName.length < 5 || couponCodeName.length > 14) {
            res.json({ status: false, message: 'Name should be Min 5 And Max 14 Character' })

        } else if (exist) {
            res.json({ status: false, message: 'Already Exist!' });

        } else {
            const saveCoupon = new Coupon({
                name: couponCodeName,
                expiry: expireDate,
                discount: discount,
                minPrice: minPrice,
                maxPrice: maxPrice,
            })
            await saveCoupon.save()
            res.json({ status: true, message: 'Added Successfully' });

        }

    } catch (error) {
        console.log(error.message);
        res.render('error')
    }

}
//--------------------------------------------------------------------------------------
const activeCoupon = async (req, res) => {
    try {
        const code = req.body.CouponName
        const couponExist = await Coupon.findOne({ name: code });
        if (couponExist) {
            const cartId = req.query.id;
            console.log("🚀 here is cartID " + cartId);
            const carts = await Cart.findOne({ _id: cartId });
            console.log("🚀 here is carts " + carts);
            const totalPrice = carts ? carts.products.reduce((acc, cur) => acc + cur.totalPrice, 0) : 0;
            const couponDate = new Date(couponExist.expiry);
            const currentDate = new Date();
            if (couponExist.minPrice <= totalPrice || couponDate > currentDate || couponExist.status === true) {

                await Cart.updateOne({ _id: cartId }, { $set: { couponId: couponExist._id } });

            } else {
                res.redirect('/checkout');
            }
            res.redirect('/checkout')
        } else {
            res.redirect('/checkout')
        }
    } catch (error) {
        console.log(error.message)
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    loadCreateCouponPage,
    insertCoupon,
    activeCoupon,
}