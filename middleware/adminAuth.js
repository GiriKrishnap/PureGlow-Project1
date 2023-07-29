const verify_admin = (req, res, next) => {
    try {

        if (req.session.adminId) {

            next()
        } else {
            res.redirect('/admin/admin-login')

        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({error:true,message:'internal sever error'})
    }
}

const logout_admin = (req, res, next) => {
    try {

        if (req.session.adminId) {

            res.redirect('/admin/dashboard');

        } else {
            next()


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