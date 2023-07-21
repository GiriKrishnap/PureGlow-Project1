////////////////////////////////////////////////////////////////////////////////
const Users = require('../models/userModels');
const bcrypt = require('bcrypt');
///////////////////////////////////////////////////////////////////////////////

////////////--LOGIN--/////////////////////////////////////////////////////////
const loadLogin = async (req, res) => {
    try {
        const admin = req.session.adminId;
        console.log(admin + '<-----ADMIN IN  ADMIN LOGIN------');
        if (admin) {
            res.render('dashboard');
        } else {
            res.render('admin-login');
        }

    } catch (error) {
        console.log(error.message);
    }
}
//--------------------------------------------------------------
const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await Users.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('admin-login', { message: 'Incorrect!' });
                } else {
                    req.session.isAdminLoggedIn = true;
                    req.session.adminId = userData._id;
                    console.log(req.session.adminId + "<----session of ADMIN is here--//--");
                    console.log(req.session.isAdminLoggedIn + '<--ADMIN LOGIN VERIFY  session is here --//--');
                    if (req.session.adminId) {
                        res.redirect('/admin/dashboard');

                    } else {
                        res.redirect('/admin/admin-login');
                    }
                }
            } else {
                res.render('admin-login', { message: 'Incorrect!' });
            }
        } else {
            res.render('admin-login', { message: 'Incorrect!' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

/////////////LOAD_DASHBOARD///////////////////////////////////////////////////////////////////////////
const loadDashboard = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            res.render('admin-home');
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
    }
}

///////////////USERS_MANAGEMENT//////////////////////////////////////////////////////////////////////////
const loadUsers = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const userData = await Users.find({ is_admin: 0 });
            res.render('users-list', { userData });
        } else {
            res.redirect('/admin/admin-login')
        }
    } catch (error) {
        console.log(error.message);
    }
}
//--------------------------------------------------------------
const blockUser = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await Users.updateOne({ _id: id }, { $set: { status: false } });
        const userData = await Users.find({ is_admin: 0 });
        if (user) {
            res.render('users-list', { message: 'user Blocked successfully', userData });
        } else {
            res.render('users-list', { message: 'user not Blocked', userData });
        }
    } catch (error) {
        console.log(error.message);
    }
}
//--------------------------------------------------------------
const unblockUser = async (req, res) => {
    try {
        const id = req.query.id;
        const user = await Users.updateOne({ _id: id }, { $set: { status: true } });
        const userData = await Users.find({ is_admin: 0 });
        if (user) {
            res.render('users-list', { userData })
        } else {
            res.render('users-list', { userData });

        }
    } catch (error) {
        console.log(error.message)
    }
}
///////////////////ADMIN_LOGOUT/////////////////////////////////////////////////////////////////////
const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadUsers,
    logout,
    blockUser,
    unblockUser,
}
//////////////////////////////////////////////////////////////////////////////////////////////////