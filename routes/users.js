// load modules
const express = require('express');
const { User }  = require('../models');
const { asyncHandler }  = require('../middleware/asyncHandler');
const { authenticateUser } = require('../middleware/authUser');

// construct router instance
const router = express.Router();

// GET request for /api/users
// if user authentication via authenticateUser middleware is successful
// code in anonymous arrow function expression will execute
router.get('/', authenticateUser, (req, res) => {
    // retrieve authenticated user data from request object
    const user = req.currentUser;
    // new object called filteredUserData that does not contain password, createdAt or updatedAt attributes
    const { password, createdAt, updatedAt, ...filteredUserData } = user.dataValues;
    // respond with 200 status and send user data via JSON resonse to client
    res.status(200).json({ ...filteredUserData });
});

// POST request for /api/users to create a new user
router.post('/', asyncHandler(async (req, res) => {
    try {
        // try to create a user using the body from the request object
        await User.create(req.body);
        // if successful, respond with header location of '/' and 201 status
        res.location('/').status(201).end();
    } catch (error) {
        // if sequelize validation or constraint error
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            // map all errors into an array
            const errors = error.errors.map(err => err.message);
            // respond with 400 status and send errors via JSON resonse to client
            res.status(400).json({ errors });
        } else {
            // otherwise throw error to be caught by global error handler
            throw error;
        }
    }
}));

// export routes
module.exports = router;