//////////////////////////////////////////////////////////////////////////////////////////////////////////
const Category = require('../models/categoryModel');
/////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////CATEGORY/////////////////////////////////////////////////////////////////////////////
const loadCategory = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn
        if (admin) {
            const categoryData = await Category.find();
            res.render('category-list', { categoryData });
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
};
//--------------------------------------------------------------
const loadAddCategory = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            res.render('add-category');
        } else {
            res.render('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
};
//--------------------------------------------------------------
const insertCategory = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const name = req.body.name;

            if (!name) {
                res.render('add-category', { message: 'incorrect value' });
            } else {
                const exist = await Category.findOne({ name: name });

                if (!exist) {

                    const category = new Category({
                        name: name,
                    });

                    const categoryData = await category.save();
                    if (categoryData) {
                        res.redirect('/admin/category-list');
                    } else {
                        res.render('add-category', { message: 'Category already exist' });
                    }
                } else {
                    res.render('add-category', { message: 'Already exist try another one' });
                }
            }
        } else {
            res.render('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//--------------------------------------------------------------
const loadEditCategory = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const id = req.query.id;
            req.session.query = id
            const categoryData = await Category.findOne({ _id: id });
            res.render('edit-category', { categoryData });
        } else {
            res.render('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
};
//--------------------------------------------------------------
const updateCategory = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        const id = req.session.query;
        if (admin) {
            const categoryDatas = await Category.find();
            const { name } = req.body;
            if (!name) {
                res.render('edit-category', { message: 'please fill the form' });
            } else {
                const exist = categoryDatas.filter((p) => p.name === name);
                if (exist.length === 0) {
                    await Category.findOneAndUpdate({ _id: id }, { $set: { name: name } });
                    res.redirect('/admin/category-list');
                } else {
                    const categoryData = await Category.findOne({ _id: id });
                    res.render('edit-category', { message: 'already exist please add another name ', categoryData });
                }

            }
        }

        delete req.session.query;

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
//--------------------------------------------------------------
const unListCategory = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const id = req.query.id
            await Category.updateOne({ _id: id }, { $set: { list: false } }).then((data) => {
                res.redirect('/admin/category-list');
            })
        } else {
            res.render('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
};
//---------------------------------------------
const listCategory = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const id = req.query.id
            await Category.updateOne({ _id: id }, { $set: { list: true } }).then((data) => {
                res.redirect('/admin/category-list');
            })
        } else {
            res.render('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
};
//////////////////////////////////////////////////////////////////////
module.exports = {
    loadCategory,
    loadAddCategory,
    insertCategory,
    loadEditCategory,
    updateCategory,
    listCategory,
    unListCategory
}
