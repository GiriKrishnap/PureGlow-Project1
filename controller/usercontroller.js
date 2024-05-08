////////////////////////////////////////////////////////////////////////////////////////////////
require('dotenv/config');
const Users = require('../models/userModels');
const Products = require('../models/productModel');
const Order = require('../models/orderModel');
const Address = require('../models/addressModel');
const Banner = require('../models/bannerModel');
const Wallet = require('../models/walletModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const securePassword = require('../config/securePassword');

// signUp //////////////////////////////////////////////////////////////////////////////////////
const loadSignup = async (req, res) => {
    try {
        req.session.referralLink = req.query.refId;
        res.render('signup')

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const insertUser = async (req, res) => {
    try {
        const { name, email, phone } = req.body
        const emailExist = await Users.findOne({ email: email })


        if (emailExist) {
            res.json({ status: false, message: 'Email Already Exist 😨' })

        } else {

            const spassword = await securePassword(req.body.password);
            const user = new Users({
                name: name,
                email: email,
                phone: phone,
                password: spassword,
                is_admin: 0
            });


            const userData = await user.save()
            //referralLink
            if (req.session.referralLink) {
                const referralUser = await Users.findOne({ _id: req.session.referralLink });
                if (referralUser.status == true) {
                    await Wallet.findOneAndUpdate({ user_id: req.session.referralLink }, { $inc: { amount: 100 } });

                    const newWallet = new Wallet({
                        user_id: userData._id,
                        amount: 50,
                    })

                    await newWallet.save();
                    delete req.session.referralLink;
                }

            }

            const otp = Math.floor(100000 + Math.random() * 900000);
            req.session.Otp = otp;
            sendVerifyMail(req.body.name, req.body.email, userData._id, otp);
            req.session.user = userData._id;
            res.json({ status: true })

        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const loadOtpVerifier = async (req, res) => {
    try {
        res.render('verify-otp');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const verifyOtp = async (req, res) => {
    try {
        const user = req.session.user

        const { v1, v2, v3, v4, v5, v6 } = req.body
        const realOtp = v1 + v2 + v3 + v4 + v5 + v6
        const userOtp = req.session.Otp
        console.log('the otp is here - ', userOtp);
        if (realOtp == userOtp) {
            if (typeof req.session.newEmail !== 'undefined') {

                await Users.updateOne({ _id: req.session.userId }, { $set: { email: req.session.newEmail } });
                delete req.session.newEmail;
                delete req.session.Otp;
                res.redirect('/profile');

            } else {

                await Users.updateOne({ _id: user }, { $set: { is_verified: 1 } });
                res.render('login', { message: 'verified 😎' });
                delete req.session.user;
                delete req.session.Otp;
            }

        } else {
            res.render('verify-otp', { message: 'Wrong...!😴' });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const sendVerifyMail = async (name, email, user_id, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST_STRING,
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.MAIL_STRING,
                pass: process.env.MAIL_PASSWORD
            }
        });
        const mailOptions = {
            from: 'yt4smallgames@gmail',
            to: email,
            subject: 'PureGlow verification OTP',
            html: `<P> Hello ${name},<br><br>
            We just need to verify your email address before you can access<br><br>
            here your otp <h4>${otp}</h4><br><br>
            Thanks for the visit ! - <h3>The pureGlow team ☺</h3></P>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("email has been send:- ", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}

// Login /////////////////////////////////////////////////////////////////////////////////////////
const loadLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const userData = await Users.findOne({ email: email });
        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {

                if (userData.is_verified === 0) {
                    res.render('login', { message: 'Verify Your Email !' });
                } else {
                    if (userData.status === false) {
                        res.render('login', { message: 'your ACC is Blocked !' });
                    } else {
                        req.session.isLoggedIn = true;
                        req.session.userId = userData._id;
                        req.session.userName = userData.name;
                        res.redirect('/');
                    }
                }
            } else {
                res.render('login', { message: 'Incorrect!' });
            }
        } else {
            res.render('login', { message: 'Incorrect!' })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// forgetPassword ///////////////////////////////////////////////////////////////////////////////////
const loadEnterEmail = async (req, res) => {
    try {
        res.render('enter-email');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// postEmailAndVerify ///////////////////////////////////////////////////////////////////////////////
const verifyEmailForFP = async (req, res) => {
    try {
        const { email } = req.body
        const emailExist = await Users.findOne({ email: email, status: true, is_verified: 1 });
        if (emailExist) {
            const { email, name } = emailExist

            const user_id = emailExist._id;
            sendForgetPassword(name, email, user_id);
            res.render('login', { message: 'Check Your Email' });
        } else {
            res.render('enter-email', { message: 'This feature is not available for this Email' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// sentForgotPasswordToEmail -----------------------------------------------------------------------
const sendForgetPassword = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST_STRING,
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.MAIL_STRING,
                pass: process.env.MAIL_PASSWORD
            }
        });
        const mailOptions = {
            from: 'yt4smallgames@gmail',
            to: email,
            subject: 'PureGlow Forgot password',
            html: `<P> Hello ${name},<br><br>
            <h4>Click the link below to Change Your Password</h4><br>
            <h3>--><a href='http://localhost:3000/new-password?id=${user_id}'>Click here</a><--</h3><br>
            Thanks for the visit ! - <h3>The pureGlow team ☺</h3></P>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("email has been send:- ", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// new-password ------------------------------------------------------------------------------------
const loadNewPassword = async (req, res) => {
    try {
        req.session.newP = req.query.id;

        if (req.session.newP) {
            res.render('new-password');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' });
    }
}
// changeToNewPassword ----------------------------------------------------------------------------
const PostChangePassword = async (req, res) => {
    try {
        const userId = req.session.newP;

        if (userId) {
            const spassword = await securePassword(req.body.password);
            await Users.findOneAndUpdate({ _id: userId }, { $set: { password: spassword } });
            delete req.session.userId
            delete req.session.isLoggedIn
            delete req.session.userName
            res.redirect('/login');
            delete req.session.newP;
        } else {
            res.status(404);
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' });
    }
}
/////// pages //////////////////////////////////////////////////////////////////////////////////////
const loadHome = async (req, res) => {
    try {
        const userName = req.session.userName;
        const productData = (await Products.find({ list: true }).limit(4)).reverse()
        const bannerData = await Banner.find({ list: true });
        res.render('home', { productData, userName, bannerData });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const loadAbout = async (req, res) => {
    try {
        const userName = req.session.userName;
        res.render('about', { userName });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const loadContact = async (req, res) => {
    try {
        const userName = req.session.userName;
        res.render('contact', { userName });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const loadUserDetails = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (userId) {
            const userData = await Users.findOne({ _id: userId });
            const userName = req.session.userName;
            const orderData = (await Order.find({ user_id: userId }).populate('products.product_id').populate('address_id')).reverse();
            const addressData = await Address.find({ user_id: userId, list: true });
            const walletData = await Wallet.findOne({ user_id: userId })
            res.render('profile', { orderData, addressData, userName, userData, walletData });
        } else {
            res.render('profile');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// Edit-Details /////////////////////////////////////////////////////////////////////////////////////
// load-edit-details-----------------------------------------------------------------------
const loadUserEdit = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {

            const userData = await Users.findOne({ _id: req.session.userId });
            res.render('edit-details', { userData });
        } else {
            res.render('/login')
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//post-edited-details----------------------------------------------------------------------------
const insertEditedDetails = async (req, res) => {
    try {
        if (req.session.isLoggedIn) {
            const { name, email, phone } = req.body;
            const emailExist = await Users.findOne({ email: email });

            if (emailExist !== null) {

                await Users.updateOne({ _id: req.session.userId }, {
                    $set: {
                        name: name,
                        phone: phone
                    }
                });
                res.json({ status: true, message: 'Your Details are Changed' });
            } else {

                await Users.updateOne({ _id: req.session.userId }, {
                    $set: {
                        name: name,
                        phone: phone
                    }
                });

                const otp = Math.floor(100000 + Math.random() * 900000);
                req.session.Otp = otp;
                req.session.newEmail = email;

                sendVerifyMail(name, email, req.session.userId, otp).then(() => {
                    res.json({ status: false });
                })
            }

        } else {
            res.render('/login')
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// logout //////////////////////////////////////////////////////////////////////////////////////////
const Logout = async (req, res) => {
    try {
        const user = req.session.isLoggedIn
        if (user) {
            delete req.session.userId
            delete req.session.isLoggedIn
            delete req.session.userName
            res.redirect('/');
        } else {
            res.redirect('/');
        }

    } catch (error) {
        res.render(error);
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    loadSignup,
    insertUser,
    loadLogin,
    verifyLogin,
    loadHome,
    loadAbout,
    loadContact,
    loadOtpVerifier,
    verifyOtp,
    Logout,
    loadUserDetails,
    loadEnterEmail,
    verifyEmailForFP,
    loadNewPassword,
    PostChangePassword,
    loadUserEdit,
    insertEditedDetails,
}
////////////////////////////////////////////////////////////////////////////////////////////////
