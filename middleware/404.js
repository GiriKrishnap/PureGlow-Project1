const _404page = (req, res, next) => {
    res.status(404).render('404page.ejs');
}

module.exports = _404page;