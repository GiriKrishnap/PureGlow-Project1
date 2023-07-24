///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Banner = require('../models/bannerModel');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const loadBannerList = async (req, res) => {
    try {
        if (req.session.isAdminLoggedIn) {
            const bannerData = await Banner.find();
            res.render('banner-list', { bannerData });
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// load-add-banner ----------------------------------------------------------------------------------------------------------
const loadAddBanner = async (req, res) => {
    try {
        if (req.session.isAdminLoggedIn) {
            res.render('add-banner');
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// insert-banner ------------------------------------------------------------------------------------------------------------
const insertBanner = async (req, res) => {
    try {
        if (req.session.isAdminLoggedIn) {
            const { title, description } = req.body
            if (!title || !description) {
                res.render('add-banner', { message: 'please add correct data' });
            } else {
                let imagesUpload = []
                for (let i = 0; i < req.files.length; i++) {
                    imagesUpload[i] = req.files[i].filename
                }
                const bannerSave = new Banner({
                    title: title,
                    description: description,
                    image: imagesUpload,
                })
                await bannerSave.save().then(() => {
                    res.render('add-banner', { message: 'banner added successfully' });
                });
            }
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// load-edit-banner ---------------------------------------------------------------------------------------------------------
const loadEditBanner = async (req, res) => {
    try {
        if (req.session.isAdminLoggedIn) {
            const bannerId = req.query.id;
            const bannerData = await Banner.findOne({ _id: bannerId });
            if (bannerData) {
                res.render('edit-banner', { bannerData });
            } else {
                res.redirect('/admin/banner-list');
            }
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// insert-edited-banner -----------------------------------------------------------------------------------------------------
const insertEditedBanner = async (req, res) => {
    try {
        if (req.session.isAdminLoggedIn) {
            const { title, description, bannerId } = req.body;
            let imagesUpload = []
            for (let i = 0; i < req.files.length; i++) {
                imagesUpload[i] = req.files[i].filename
            }
            const bannerUpdate = await Banner.updateOne({ _id: bannerId }, {
                $set: {
                    title: title,
                    description: description,
                    image: imagesUpload
                }
            }).then(() => {
                res.redirect('/admin/banner-list');
            });
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// delete-banner ------------------------------------------------------------------------------------------------------------
const deleteBanner = async (req, res) => {
    try {
        if (req.session.isAdminLoggedIn) {
            const BannerId = req.query.id;
            await Banner.deleteOne({ _id: BannerId }).then(() => {
                res.redirect('/admin/banner-list');
            })
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// unList-banner ------------------------------------------------------------------------------------------------------------
const unListBanner = async (req, res) => {
    try {
        if (req.session.isAdminLoggedIn) {
            const bannerId = req.query.id
            const update = await Banner.updateOne({ _id: bannerId }, { $set: { list: false } }).then(() => {
                res.redirect('/admin/banner-list');
            })

        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
// list-banner --------------------------------------------------------------------------------------------------------------
const listBanner = async (req, res) => {
    try {
        if (req.session.isAdminLoggedIn) {
            const bannerId = req.query.id
            const update = await Banner.updateOne({ _id: bannerId }, { $set: { list: true } }).then(() => {
                res.redirect('/admin/banner-list');
            })
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}

module.exports = {
    loadBannerList,
    loadAddBanner,
    insertBanner,
    loadEditBanner,
    insertEditedBanner,
    deleteBanner,
    unListBanner,
    listBanner,
}