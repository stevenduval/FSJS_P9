const express = require('express');
const { Course, User }  = require('./models');

// Construct a router instance.
const router = express.Router();

function asyncHandler(cb) {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (error) {
        // Forward error to the global error handler
        next(error);
      }
    }
  }

router.get('/users', asyncHandler(async(req, res) => {
    res.status(200).json({ "message": "Account successfully created!" });
}));

router.post('/users', asyncHandler(async(req, res) => {
    try {
        await User.create(req.body);
        res.location('/').status(201).end();
      } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });   
        } else {
          throw error;
        }
      }
}));


router.get('/courses', asyncHandler(async(req, res) => {
    const courses = await Course.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include: [{
            model: User,
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            },
        }],
    });
    res.status(200).json({ courses });
}));

router.post('/courses', asyncHandler(async(req, res) => {
    let course; 
    try {
        course = await Course.create(req.body);
        res.location('/').status(201).end();
      } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });   
        } else {
          throw error;
        }
      }
}));


router.get('/courses/:id', asyncHandler(async(req, res) => {
    const courses = await Course.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        where: {
            id: req.params.id,
        },
        include: [{
            model: User,
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt']
            },
        }],
    });
    res.status(200).json({ courses });
}));

module.exports = router;