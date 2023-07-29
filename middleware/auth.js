
const User = require('../models/userModels');
const verify_user = async (req, res, next) => {
    try {
        if (req.session.userId) {
            const userData = await User.findOne({ _id: req.session.userId });
            if (userData.status != false) {
                next()
            } else {
                delete req.session.userId
                delete req.session.userName
                delete req.session.isLoggedIn
                res.redirect('/login')
            }
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}

const logout_user = (req, res, next) => {
    try {
        if (req.session.userId) {
            res.redirect('/');
        } else {
            next()
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}

module.exports = {
    verify_user,
    logout_user
}