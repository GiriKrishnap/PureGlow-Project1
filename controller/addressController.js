////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const Users = require('../models/userModels');
const Products = require('../models/productModel');
const Cart = require('../models/cartModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const addAddress = async (req, res) => {
    try {
        const user = req.session.userId;
        if (user) {
            const userData = await Users.findOne({ _id: user });
            res.render('address-form', { userData });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const insertAddress = async (req, res) => {
    try {
        const user = req.session.isLoggedIn
        if (user) {
            const { name, phone, email, address, state, district, city, landMark, pincode } = req.body
            if (!name || !phone || !email || !address || !state || !district || !city || !landMark || !pincode) {
                res.render('address-form', { user, message: "please fill form correctly" });
            } else {

                const saveAddress = new Address({
                    user_id: req.session.userId,
                    name: name,
                    phone: phone,
                    email: email,
                    address: address,
                    state: state,
                    district: district,
                    city: city,
                    landMark: landMark,
                    pincode: pincode
                });

                await saveAddress.save();
                res.redirect('/profile');

            }
        } else {
            res.redirect('/');
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const deleteAddress = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        if (user) {
            const id = req.query.id;
            const deleted = await Address.updateOne({ _id: id }, { $set: { list: false } });
            if (deleted) {
                res.redirect('/profile');
            }
        } else {
            res.redirect('/login');
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const editAddress = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const id = req.query.id;
            req.session.addressId = id;
            const userAddress = await Address.findOne({ _id: id });
            res.render('edit-address', { userAddress });
        } else {
            res.redirect('/')
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
const updateAddress = async (req, res) => {
    try {
        const user = req.session.isLoggedIn;
        if (user) {
            const { name, phone, email, address, state, district, city, landMark, pincode } = req.body;
            const id = req.session.addressId;
            const updated = await Address.updateOne({ _id: id }, {
                $set: {
                    name: name,
                    phone: phone,
                    email: email,
                    address: address,
                    state: state,
                    district: district,
                    city: city,
                    landMark: landMark,
                    pincode: pincode
                }
            }).then(() => {
                res.redirect('/cart');
                delete req.session.addressId;
            })
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
module.exports = {
    addAddress,
    insertAddress,
    deleteAddress,
    editAddress,
    updateAddress,

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 