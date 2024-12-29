// load modules
const express = require('express');
const users = require('./users');
const courses = require('./courses');

// construct a router instance
const router = express.Router();

// Import users and courses routes into the /api path
router.use('/users', users);
router.use('/courses', courses);

// export routes
module.exports = router;