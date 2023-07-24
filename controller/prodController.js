//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Users = require('../models/userModels')
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////+-A_D_M_I_N-S_I_D_E-+///////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------------------------------------------
const loadAdminProductlist = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const productData = await Product.find().populate('category');

            if (productData) {
                res.render('product-list', { productData })
            }
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//------------------------------------------------------------------------------------------------------------------
const loadAddProduct = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const categoryData = await Category.find({ list: true });
            res.render('add-product', { categoryData, errors: '' })
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//--------------------------------------------------------------------------------------------------------
const insertProduct = async (req, res) => {
    try {

        const categoryData = await Category.find({ list: true });
        const { productName, category, price, discount, quantity, description } = req.body
        if (price < 0 || discount < 0 || quantity < 0) {
            res.render('add-product', { categoryData, message: "negative numbers is not allowed" })
        } else {
            if (!productName || !category || !price || !discount || !quantity || !description) {
                res.render('add-product', { categoryData, message: "invalid field here please fill" })
            } else {
                let imagesUpload = []
                for (let i = 0; i < req.files.length; i++) {
                    imagesUpload[i] = req.files[i].filename
                }
                const product = new Product({
                    productName: productName,
                    category: category,
                    price: price,
                    discount: discount,
                    quantity: quantity,
                    description: description,
                    images: imagesUpload
                })

                const productData = await product.save();

                if (productData) {
                    res.render('add-product', { categoryData, message: "product added successfully" })
                } else {
                }

            }
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//------------------------------------------------------------------------------------------------------------------
const loadEditProduct = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const id = req.query.id;
            const categoryData = await Category.find({ list: true });
            const productData = await Product.findOne({ _id: id }).populate('category');
            if (productData) {
                res.render('edit-product', { productData, categoryData })
            } else {
                res.render('edit-product');
            }
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//------------------------------------------------------------------------------------------------------------------
const updateEditProduct = async (req, res) => {
    try {
        const id = req.body.id;
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const { productName, category, price, discount, quantity, description } = req.body
            if (price < 0 || discount < 0 || quantity < 0) {
                const categoryData = await Category.find({ list: true });
                const productData = await Product.findOne({ _id: id });
                res.render('edit-product', { productData, categoryData, message: "Negative number not allowed" });
            } else {
                const imagesUpload = []
                for (let i = 0; i < req.files.length; i++) {
                    imagesUpload[i] = req.files[i].filename
                    await Product.updateOne({ _id: id }, { $push: { images: imagesUpload[i] } })
                }
                const productData = await Product.findByIdAndUpdate({ _id: id }, {
                    $set: {
                        productName: productName,
                        category: category,
                        price: price,
                        discount: discount,
                        quantity: quantity,
                        description: description,
                    }
                }).then((response) => {
                    res.redirect('/admin/product-list')
                })
            }
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//------------------------------------------------------------------------------------------------------------------
const deleteImgInEditProducts = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const { id, images } = req.body;


            const updatedProduct = await Product.findOneAndUpdate(
                { _id: id },
                { $pull: { images: images } },
                { new: true }
            )
            if (updatedProduct) {
                res.redirect(`/edit-product?id=${id}`);
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
};
//------------------------------------------------------------------------------------------------------------------
const productlist = async (req, res) => {
    try {
        const id = req.query.id;
        await Product.updateOne({ _id: id }, { $set: { list: true } }).then((response) => {
            res.redirect('/admin/product-list')
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//------------------------------------------------------------------------------------------------------------------
const productUnList = async (req, res) => {
    try {
        const id = req.query.id;
        await Product.updateOne({ _id: id }, { $set: { list: false } }).then((response) => {
            res.redirect('/admin/product-list')
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//////////////////////////////+-U_S_E_R-S_I_D_E-+///////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------------------------------------------
const loadUserProducts = async (req, res) => {
    try {
        const productData = await Product.find({ list: true });
        const categoryData = await Category.find();
        if (req.session.userId) {
            const userData = await Users.findOne({ _id: req.session.userId });
            if (userData) {
                res.render('products', { productData, category: categoryData, user: userData });
            } else {
                res.render('products', { productData, category: categoryData, user: 'login' });
            }
        } else {
            res.render('products', { productData, category: categoryData, user: 'login' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//------------------------------------------------------------------------------------------------------------------
const loadSingleProduct = async (req, res) => {
    try {
        const category = await Category.find();
        const productId = req.query.id;
        const user = req.session.isLoggedIn;
        const productData = await Product.find({ _id: productId }).populate('category');
        const productsData = await Product.find({ list: true, _id: { $ne: productId } }).populate('category').limit(4)
        res.render('single-product', { productData, user, category, products: productsData });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    insertProduct,
    loadAdminProductlist,
    loadAddProduct,
    updateEditProduct,
    loadEditProduct,
    loadSingleProduct,
    deleteImgInEditProducts,
    productlist,
    productUnList,
    loadUserProducts

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
