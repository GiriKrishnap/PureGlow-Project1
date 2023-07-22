const verify_admin = (req, res, next) => {
    try {
        console.log(`VERIFY_ADMIN session-----> ${req.session.adminId}`)
        if (req.session.adminId) {
            console.log('admin verified --------------------')
            next()
        } else {
            res.redirect('/admin/admin-login')
            console.log('VERIFY ADMIN SESSION NOT FOUND !!---------------');
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({error:true,message:'internal sever error'})
    }
}

const logout_admin = (req, res, next) => {
    try {
        console.log(`logout admin session ${req.session.adminId}`)
        if (req.session.adminId) {
            console.log('logout admin go to dashboard----------------');
            res.redirect('/admin/dashboard');

        } else {
            next()
            console.log('LOGOUT_ADMIN SESSION NOT FOUND !!---------------');

        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({error:true,message:'internal sever error'})
    }
}

module.exports = {
    verify_admin,
    logout_admin
}