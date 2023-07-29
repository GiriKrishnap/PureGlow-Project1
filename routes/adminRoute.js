////modules/////////////////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const router = express();
const auth = require('../middleware/adminAuth');
const multerConfig = require('../config/multer');
const upload = multerConfig.upload;
//----------------------------------------------------------------------------------------------------
const adminController = require('../controller/admincontroller');
const productController = require('../controller/prodController');
const orderController = require('../controller/orderController');
const categoryController = require('../controller/categoryController');
const bannerController = require('../controller/bannerController');
const couponController = require('../controller/couponController');
/////////////////////////////////////////////////////////////////////////////////////////////////////
//views---------------------------------------------------------------------------------------------
router.set('views', './views/admin');
/////////////////////////////////////////////////////////////////////////////////////////////////////

//AdminLogin---------------------------------------------------------------
router.get('/admin-login', auth.logout_admin, adminController.loadLogin);
router.post('/admin-login', auth.logout_admin, adminController.verifyLogin);
//AdminDashBoard------------------------------------------------------------
router.get('/dashboard', auth.verify_admin, adminController.loadDashboard);
router.get('/', auth.verify_admin, adminController.loadDashboard);
//AdminUserManagements------------------------------------------------------
router.get('/users', auth.verify_admin, adminController.loadUsers);
router.get('/block-user', auth.verify_admin, adminController.blockUser);
router.get('/unblock-user', auth.verify_admin, adminController.unblockUser);
//AdminProductsManagements--------------------------------------------------
router.get('/product-list', auth.verify_admin, productController.loadAdminProductlist);
router.get('/add-product', auth.verify_admin, productController.loadAddProduct);
router.post('/add-product', auth.verify_admin, upload.array('images', 5), productController.insertProduct);
router.get('/edit-product', auth.verify_admin, productController.loadEditProduct);
router.post('/edit-product', auth.verify_admin, upload.array('images', 5), productController.updateEditProduct);
router.get('/list-product', auth.verify_admin, productController.productlist);
router.get('/unList-product', auth.verify_admin, productController.productUnList);
router.delete('/delete-edit-productimages', auth.verify_admin, productController.deleteImgInEditProducts);
//AdminCategoryManagements----------------------------------------------------
router.get('/category-list', auth.verify_admin, categoryController.loadCategory);
router.get('/add-category', auth.verify_admin, categoryController.loadAddCategory);
router.post('/add-category', auth.verify_admin, categoryController.insertCategory);
router.get('/update-category', auth.verify_admin, categoryController.loadEditCategory);
router.post('/update-category', auth.verify_admin, categoryController.updateCategory);
router.get('/list-category', auth.verify_admin, categoryController.listCategory);
router.get('/unList-category', auth.verify_admin, categoryController.unListCategory);
//AdminOrderManagements----------------------------------------------------------
router.get('/order-management', auth.verify_admin, orderController.loadOrderManagement);
router.patch('/order-shipped', auth.verify_admin, orderController.orderShipped);
router.get('/adminCancel-order', auth.verify_admin, orderController.AdminCancelOrder);
//AdminBannerManagements-----------------------------------------------------------
router.get('/banner-list', auth.verify_admin, bannerController.loadBannerList);
router.get('/add-banner', auth.verify_admin, bannerController.loadAddBanner);
router.post('/add-banner', auth.verify_admin, upload.array('images', 5), bannerController.insertBanner);
router.get('/edit-banner', auth.verify_admin, bannerController.loadEditBanner);
router.post('/edit-banner', auth.verify_admin, upload.array('images', 5), bannerController.insertEditedBanner);
router.get('/delete-banner', auth.verify_admin, bannerController.deleteBanner);
router.get('/banner-unlistBanner', auth.verify_admin, bannerController.unListBanner)
router.get('/banner-listBanner', auth.verify_admin, bannerController.listBanner)
//AdminCouponsManagements----------------------------------------------------------
router.get('/create-coupon', auth.verify_admin, couponController.loadCreateCouponPage);
router.post('/create-coupon', auth.verify_admin, couponController.insertCoupon);
//AdminLogout----------------------------------------------------------------------
router.get('/admin-logout', auth.verify_admin, adminController.logout);
//---------------------------------------------------------------------------------
/////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;