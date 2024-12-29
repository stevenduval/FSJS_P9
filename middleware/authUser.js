// load modules
const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../models');

// authenticateUser middleware
exports.authenticateUser = async (req, res, next) => {
    // store credentials from authorization request
    const credentials = auth(req);
    // if credentials
    if (credentials) {
        // find user based on their email in User model
        const user = await User.findOne({ where: { emailAddress: credentials.name } });
        // if user exists
        if (user) {
            // compare password from request to password stored in User Model
            const authenticated = bcrypt.compareSync(credentials.pass, user.password);
            // if passwords match
            if (authenticated) {
                // store user data retrieved from User model on the request object
                req.currentUser = user;
                // return to execute remainder of request from where authenticateUser was called
                return next();
            } 
        } 
    }
    // otherwise respond as 401 and send Access Denied message
    res.status(401).json({ message: 'Access Denied' });
};