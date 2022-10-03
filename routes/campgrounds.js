const express = require('express');
const router = express.Router();
const { campgroundSchema } = require('../schemas')
const catchAsync = require('../utils/catchAsync')

const expressError = require('../utils/ExpressError')
const Campground = require('../models/campground')

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}


router.get('/', async (req, res) => {
    res.render('campgrounds/homepage')
})


//create a new camp
router.get('/makecampground', validateCampground, catchAsync(async (req, res) => {
    const camp = new Campground({ title: 'My Backyard', description: 'Cheap camping' });
    await camp.save();
    res.send(camp)
}))


//view all of the camps
router.get('/all', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))


//new camp
router.get('/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new')
}))

router.post('/', validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully created a new campground.')
    res.redirect(`/campgrounds/${campground._id}`)
}))


//view a precise camp
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Cannot find the campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))


//edit campground
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find the campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}))
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated a campground.')
    res.redirect(`/campgrounds/${campground._id}`)
}))


//delete
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`)
}))

module.exports = router;