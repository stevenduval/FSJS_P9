// load modules
const express = require('express');
const { Course, User } = require('../models');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateUser } = require('../middleware/authUser');

// construct a router instance
const router = express.Router();

// GET request for /api/courses && /api/courses/:id
router.get(['/', '/:id'], asyncHandler(async (req, res) => {
    // if request has id param, return where clause, otherwise return null
    let where = req.params.id ? { id: req.params.id } : null;
    // find all courses in the Course Model
    // exclude createdAt and updatedAt fields from Course Model results
    // include User Model and exclude password, createdAt and updatedAt fields from User Model results
    const courses = await Course.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        where,
        include: [{
            model: User,
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            },
        }],
    });
    // respond with 200 status and send course data via JSON resonse to client
    res.status(200).json({ courses });
}));

// POST request for /api/courses
// if user authentication via authenticateUser middleware is successful
// code in asyncHandler function will execute
router.post('/', authenticateUser, asyncHandler(async (req, res) => {
    // retrieve authenticated user data from request object
    const user = req.currentUser;
    // update request body object, so that it contains existing info plus userId value
    req.body = { ...req.body, userId: user.id };
    try {
        // try to create a course using the body from the request object
        let course = await Course.create(req.body);
        // if successful, respond with header location of '/courses/:id' and 201 status
        res.location(`/courses/${course.id}`).status(201).end();
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

// PUT request for /api/courses/:id
// if user authentication via authenticateUser middleware is successful
// code in asyncHandler function will execute
router.put('/:id', authenticateUser, asyncHandler(async (req, res) => {
    // retrieve authenticated user data from request object
    const user = req.currentUser;
    try {
        // find course in Course Model
        let course = await Course.findByPk(req.params.id);
        // if course exists
        if (course) {
            // if the userId on the course is equal to authenticated user id
            if (course.userId === user.id) {
                // update the course
                await course.update(req.body);
                // respond with 204 status
                res.status(204).end();
            } else {
                // respond with 403 status if authenticated user does not own the course
                res.status(403).end();
            }
        } else {
            // if course does not exist, send 404 status
            res.status(404).end();
        }
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

// DELETE request for /api/courses/:id
// if user authentication via authenticateUser middleware is successful
// code in asyncHandler function will execute
router.delete('/:id', authenticateUser, asyncHandler(async (req, res) => {
    // retrieve authenticated user data from request object
    const user = req.currentUser;
    try {
        // find course in Course Model
        let course = await Course.findByPk(req.params.id);
        // if course exists
        if (course) {
            // if the userId on the course is equal to authenticated user id
            if (course.userId === user.id) {
                // delete the course
                await course.destroy();
                // respond with 204 status
                res.status(204).end();
            } else {
                // respond with 403 status if authenticated user does not own the course
                res.status(403).end();
            }
        } else {
            // if course does not exist, send 404 status
            res.status(404).end();
        }
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