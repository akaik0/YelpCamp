const express = require('express');
const router = express.Router();
const user = require('../controllers/users')
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const LocalStrategy = require('passport-local')

router.route('/register')
    .get(user.registerForm)
    .post(catchAsync(user.register))
router

router.route('/login')
    .get(user.loginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', failureMessage: true }), catchAsync(user.login))

router.get('/logout', user.logout)

module.exports = router;