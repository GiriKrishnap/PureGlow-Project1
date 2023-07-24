////////////////////////////////////////////////////////////////////////////////////////////////
require('dotenv/config');
const Users = require('../models/userModels');
const Products = require('../models/productModel');
const Order = require('../models/orderModel');
const Address = require('../models/addressModel');
const Banner = require('../models/bannerModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
///////////////////////////////////////////////////////////////////////////////////////////////
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// signUp //////////////////////////////////////////////////////////////////////////////////////
const loadSignup = async (req, res) => {
    try {
        res.render('signup')
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = new Users({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: spassword,
            is_admin: 0
        });
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        const phone = req.body.phone.toString();

        if (password !== confirmPassword || phone.length !== 10 || typeof user.phone !== 'number') {
            res.render('signup', { message: 'Fill It Correctly!.' });
        } else {
            const userData = await user.save();
            if (userData) {
                const otp = Math.floor(100000 + Math.random() * 900000);
                req.session.Otp = otp;
                sendVerifyMail(req.body.name, req.body.email, userData._id, otp);
                req.session.user = userData._id;
                res.redirect('/verify-otp');
            } else {
                res.render('signup', { message: 'Signup Failed' });
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const loadOtpVerifier = async (req, res) => {
    try {
        const user = req.session.user
        if (user) {
            res.render('verify-otp')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const verifyOtp = async (req, res) => {
    try {
        const user = req.session.user
        if (user) {
            const { v1, v2, v3, v4, v5, v6 } = req.body
            const realOtp = v1 + v2 + v3 + v4 + v5 + v6
            const userOtp = req.session.Otp
            if (realOtp == userOtp) {
                const updateInfo = await Users.updateOne({ _id: user }, { $set: { is_verified: 1 } });
                res.render('login', { message: 'SignUp was successful' });
                delete req.session.user;
                delete req.session.Otp
            } else {
                res.render('verify-otp', { message: 'Wrong Answer' });
            }
        } else {
            res.redirect('/signup');
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
            console.log(`${email},${name} is here hello 200`);
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
        console.log(`${userId} userId is here postChangePassword`);
        if (userId) {
            const spassword = await securePassword(req.body.password);
            await Users.findOneAndUpdate({ _id: userId }, { $set: { password: spassword } });
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
        const productData = await Products.find({ list: true }).limit(4)
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
        res.render('about');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// ---------------------------------------------------------------------------------------------
const loadContact = async (req, res) => {
    try {
        res.render('contact');
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

            const orderData = (await Order.find({ user_id: userId }).populate('products.product_id').populate('address_id')).reverse();

            const addressData = await Address.find({ user_id: userId, list: true });
            res.render('profile', { orderData, addressData });
        } else {
            res.render('profile');
        }
    } catch (error) {
        console.log(error.message);
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
}
////////////////////////////////////////////////////////////////////////////////////////////////
