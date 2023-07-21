const session = require('express-session');
require('dotenv/config');

const sessionMW = session({
    secret: process.env.SESSION_SECRET_KEY,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 },
    resave: false
})

module.exports = sessionMW