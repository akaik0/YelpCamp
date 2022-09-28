const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground')
const ejsMate = require('ejs-mate')
const morgan = require('morgan')
const catchAsync = require('./utils/catchAsync')
const expressError = require('./utils/ExpressError')
const { campgroundSchema } = require('./schemas')


const methodOverride = require('method-override');
const campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(morgan('tiny'))


app.get('/', async (req, res) => {
    res.render('campgrounds/homepage')
})

//validation middleware

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

//create a new camp
app.get('/makecampground', validateCampground, catchAsync(async (req, res) => {
    const camp = new Campground({ title: 'My Backyard', description: 'Cheap camping' });
    await camp.save();
    res.send(camp)
}))


//view all of the camps
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))


//new camp
app.get('/campgrounds/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new')
}))
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

}))


//view a precise camp
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground })
}))


//edit campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}))
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}))


//delete
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`)
}))



app.all('*', (req, res, next) => {
    next(new expressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) { err.message = 'Something went wrong' }
    res.status(statusCode).render('error', { err })
}

)

app.listen(8080, () => {
    console.log('Serving on port 8080')
})
