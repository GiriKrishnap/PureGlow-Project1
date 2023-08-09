//----------------------------------------------
const express = require('express');
const router = express();
const auth = require('../middleware/auth');
//-----------------------------------------------------------------------------
const userController = require('../controller/usercontroller');
const productController = require('../controller/prodController');
const cartController = require('../controller/cartController');
const addressController = require('../controller/addressController');
const orderController = require('../controller/orderController');
const couponController = require('../controller/couponController');
const wishlistController = require('../controller/wishlistController');
//-----------------------------------------------------------------------------
router.set('views', './views/user');
//signup----------------------------------------------------------------------
router.get('/signup', auth.logout_user, userController.loadSignup);
router.post('/signup', auth.logout_user, userController.insertUser);
//login-----------------------------------------------------------------------
router.get('/login', auth.logout_user, userController.loadLogin);
router.post('/login', auth.logout_user, userController.verifyLogin);
//emailVerify-----------------------------------------------------------------
router.get('/verify-otp', userController.loadOtpVerifier);
router.post('/verify-otp', userController.verifyOtp);
//ForgetPassword--------------------------------------------------------------
router.get('/enter-email', userController.loadEnterEmail);
router.post('/enter-email', userController.verifyEmailForFP);
router.get('/new-password', userController.loadNewPassword);
router.post('/new-password', userController.PostChangePassword);
//Edit-UserDetails------------------------------------------------------------
router.get('/edit-details', auth.verify_user, userController.loadUserEdit);
router.post('/edit-details', auth.verify_user, userController.insertEditedDetails);
//Products--------------------------------------------------------------------
router.get('/products', productController.loadUserProducts);
router.get('/single-product', productController.loadSingleProduct);
//Cart------------------------------------------------------------------------
router.get('/add-to-cart', auth.verify_user, cartController.addToCart);
router.get('/cart', auth.verify_user, cartController.loadCart);
router.get('/remove-product', auth.verify_user, cartController.removeProduct);
router.patch('/inc', auth.verify_user, cartController.incrementQuantity);
router.patch('/dec', auth.verify_user, cartController.decrementQuantity);
//Address ---------------------------------------------------------------------
router.get('/add-address', auth.verify_user, addressController.addAddress);
router.post('/add-address', auth.verify_user, addressController.insertAddress);
router.get('/delete-address', auth.verify_user, addressController.deleteAddress);
router.get('/edit-address', auth.verify_user, addressController.editAddress);
router.post('/edit-address', auth.verify_user, addressController.updateAddress);
//Checkout -------------------------------------------------------------------
router.get('/checkout', auth.verify_user, orderController.loadCheckout);
router.post('/placed-order', auth.verify_user, orderController.placedOrder);
router.post('/verify-payment', auth.verify_user, orderController.verifyPayment);
//UserDetails -----------------------------------------------------------------
router.get('/profile', auth.verify_user, userController.loadUserDetails);
router.get('/cancel-order', auth.verify_user, orderController.cancelOrder);
//wishlist ---------------------------------------------------------------------
router.get('/wishlist', auth.verify_user, wishlistController.loadWishlist);
router.post('/add-to-wishlist', auth.verify_user, wishlistController.addToWishlist);
//Coupon -----------------------------------------------------------------------
router.post('/activeCoupon', auth.verify_user, couponController.activeCoupon);
//home-------------------------------------------------------------------------
router.get('/', userController.loadHome);
router.get('/home', userController.loadHome);
//about -----------------------------------------------------------------------
router.get('/about', userController.loadAbout);
//contact ---------------------------------------------------------------------
router.get('/contact', userController.loadContact);
//logout ----------------------------------------------------------------------
router.get('/logout', auth.verify_user, userController.Logout);
//-----------------------------------------------------------------------------
module.exports = router;
//------------------------------------------------------------------------------