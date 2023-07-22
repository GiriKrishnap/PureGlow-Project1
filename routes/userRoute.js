/////////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const router = express();
const auth = require('../middleware/auth');
//-----------------------------------------------------------------------------
const userController = require('../controller/usercontroller');
const productController = require('../controller/prodController');
const cartController = require('../controller/cartController');
const addressController = require('../controller/addressController');
const orderController = require('../controller/orderController');
//-----------------------------------------------------------------------------
/////////////////////////////////////////////////////////////////////////////////////
router.set('views', './views/user');
/////////////////////////////////////////////////////////////////////////////////////
//signup------------------------------------------------------------------
router.get('/signup', auth.logout_user, userController.loadSignup);
router.post('/signup', auth.logout_user, userController.insertUser);
//login-------------------------------------------------------------------
router.get('/login', auth.logout_user, userController.loadLogin);
router.post('/login', auth.logout_user, userController.verifyLogin);
//emailVerify-------------------------------------------------------------
router.get('/verify-otp', userController.loadOtpVerifier);
router.post('/verify-otp', userController.verifyOtp);
//ForgetPassword-------------------------------------------------------------
router.get('/enter-email', auth.logout_user, userController.loadEnterEmail);
router.post('/enter-email', auth.logout_user, userController.verifyEmailForFP);
router.get('/new-password', auth.logout_user, userController.loadNewPassword);
router.post('/new-password', auth.logout_user, userController.PostChangePassword);
//home---------------------------------------------------------------------
router.get('/', userController.loadHome);
router.get('/home', userController.loadHome);
//Products-----------------------------------------------------------------
router.get('/products', productController.loadUserProducts);
router.get('/single-product', productController.loadSingleProduct);
//Cart---------------------------------------------------------------------
router.get('/add-to-cart', auth.verify_user, cartController.addToCart);
router.get('/cart', auth.verify_user, cartController.loadCart);
router.get('/remove-product', auth.verify_user, cartController.removeProduct);
router.get('/inc', auth.verify_user, cartController.incrementQuantity);
router.get('/dec', auth.verify_user, cartController.decrementQuantity);
//logout-------------------------------------------------------------------
router.get('/logout', userController.Logout);
//about--------------------------------------------------------------------
router.get('/about', userController.loadAbout);
//contact------------------------------------------------------------------
router.get('/contact', userController.loadContact);
//Address------------------------------------------------------------------
router.get('/add-address', auth.verify_user, addressController.addAddress);
router.post('/add-address', auth.verify_user, addressController.insertAddress);
router.get('/delete-address', auth.verify_user, addressController.deleteAddress);
router.get('/edit-address', auth.verify_user, addressController.editAddress);
router.post('/edit-address', auth.verify_user, addressController.updateAddress);
//Checkout-----------------------------------------------------------------
router.get('/checkout', auth.verify_user, orderController.loadCheckout);
router.post('/placed-order', auth.verify_user, orderController.placedOrder);
//UserDetails---------------------------------------------------------------
router.get('/profile', auth.verify_user, userController.loadUserDetails);
router.get('/cancel-order', auth.verify_user, orderController.cancelOrder);
///////////////////////////////////////////////////////////////////////////////////
module.exports = router;
