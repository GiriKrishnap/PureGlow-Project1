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
                res.json({ status: false, message: 'fill the Field' });
            } else {
                const exist = await Category.findOne({ name: new RegExp('^' + name + '$', 'i') });

                if (!exist) {

                    const category = new Category({
                        name: name,
                    });
                    await category.save();
                    res.json({ status: true, message: 'Added Successfully' });
                } else {
                    res.json({ status: false, message: 'Already exist try another one' });
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

        if (admin) {
            const name = req.body.categoryName;

            const exist = await Category.findOne({ name: new RegExp('^' + name + '$', 'i') });

            if (!exist) {
                const id = req.body.categoryId;
                await Category.updateOne({ _id: id }, { $set: { name: name } });
                res.json({ status: true, message: 'Successfully Updated' })

            } else {
                res.json({ status: false, message: 'This Name Already Exist' });
            }
        }


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
