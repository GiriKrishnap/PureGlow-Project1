////////////////////////////////////////////////////////////////////////////////
const Users = require('../models/userModels');
const bcrypt = require('bcrypt');
const Orders = require('../models/orderModel');
const Products = require('../models/productModel');
const Category = require('../models/categoryModel');
//--
const path = require('path');
const fs = require('fs');
const pdf = require('html-pdf');
const ejs = require('ejs');
///////////////////////////////////////////////////////////////////////////////

////////////--LOGIN--/////////////////////////////////////////////////////////
const loadLogin = async (req, res) => {
    try {
        const admin = req.session.adminId;
        if (admin) {

            res.render('dashboard');
        } else {
            res.render('admin-login');
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
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
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}

/////////////LOAD_DASHBOARD///////////////////////////////////////////////////////////////////////////
const loadDashboard = async (req, res) => {
    try {
        const admin = req.session.isAdminLoggedIn;
        if (admin) {
            const orderNumber = await Orders.countDocuments({});
            const userNumber = await Users.countDocuments({});
            const productNumber = await Products.countDocuments({});
            const categoryNumber = await Category.countDocuments({});
            const pipeline = [
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$totalPrice' }
                    }
                }
            ];
            const aggregationResult = await Orders.aggregate(pipeline)

            let totalRevenue = aggregationResult[0].totalAmount;

            res.render('admin-home', { orderNumber, userNumber, totalRevenue, productNumber, categoryNumber });
        } else {
            res.redirect('/admin/admin-login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
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
        res.status(500).json({ error: true, message: 'internal sever error' })
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
        res.status(500).json({ error: true, message: 'internal sever error' })
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
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}
///////////////////SALES_REPORT////////////////////////////////////////////////////////////////////
const loadSalesReport = async (req, res) => {
    try {

        const orderData = await Orders.find({ status: "delivered" }).populate('address_id').populate('user_id')
        res.render('sales-report', { orderData: orderData.reverse() })

    } catch (error) {
        console.log(err.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
    }
}


//--date
const searchDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;


        const productData = await Orders.find().populate('address_id');
        const deliveryDate = productData.map(data => {
            const year = data.deliveryDate.getFullYear();
            const month = String(data.deliveryDate.getMonth() + 1).padStart(2, '0');
            const day = String(data.deliveryDate.getDate()).padStart(2, '0');
         

            return `${year}-${month}-${day}`;

        });

        const filterOrders = productData.filter(data => {
            const date = data.deliveryDate.toISOString().substr(0, 10);
            return data.status == 'delivered' && date >= startDate && date <= endDate
        });
   

        const data = {
            orderSuccess: filterOrders
        }
        const filePath = path.join(__dirname, '..', 'views', 'admin', 'salesPdf.ejs');

        const htmlString = fs.readFileSync(filePath).toString();

        const ejsData = ejs.render(htmlString, { data: data.orderSuccess });
        let options = {
            format: "A4",
            orientation: "portrait",
            border: "10mm",
            html: htmlString
        }
        pdf.create(ejsData, options).toStream((err, stream) => {
            if (err) {
                console.log('pdf error : ' + err);
            }
            res.set({
                'content-Type': 'application/pdf',
                'content-Disposition': 'attachment; filename="sales-report.pdf"'
            });

            stream.pipe(res);
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: true, message: 'internal server error' });
    }
}
///////////////////ADMIN_LOGOUT////////////////////////////////////////////////////////////////////
const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: true, message: 'internal sever error' })
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
    loadSalesReport,
    searchDate,
}
//////////////////////////////////////////////////////////////////////////////////////////////////