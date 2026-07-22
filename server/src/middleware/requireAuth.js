function requireAuth(req, res, next) {
    if (!req.session.userID) {
        return res.status(401).json({
            success: false, 
            message: 'You must log in first.'
        })
    }
    return next();
}

module.exports = {requireAuth};