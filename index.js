const express = require("express")
const path = require("path")
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require("ejs-mate")
const session = require("express-session")
const flash = require("connect-flash")

const AppError = require("./utils/AppError")
const catchAsync = require("./utils/catchAsync")

const reviews = require("./routes/reviews")
const campgrounds = require("./routes/campgrounds")


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("connected successfully")
    })
    .catch((err) => {
        console.log("something error")
        console.log(err)
    })
const app = express()

app.engine('ejs', ejsMate) 
app.set("view engine", 'ejs')
app.set("views", path.join(__dirname, 'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname , "public")))
const sessionConfig = {
    secret:"ThisIsAVerySecret!",
    resave:false,
    saveUninitialized :true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use((req,res,next)=>{
    res.locals.success = req.flash('success')
    res.locals.error = req.flash("error")
    next()
})

app.get("/", (req, res) => {
    res.render('home')
})
app.use('/campgrounds', campgrounds)
app.use("/campgrounds/:id/reviews" , reviews)

app.all("*", (req,res,next)=>{
    next(new AppError("Page not found" , 400))
})

app.use((err ,req,res,next)=>{
    const { status= 500 } = err
    if (!err.message) { err.message = "Something went wrong!!!"}
    res.status(status).render("error", { err })
}) // this is custom error handler which can handle error from all routes if thrown at time of running
// but this cannot handle async request and they need to be defined at end
app.listen(3000, () => {
    console.log("listening on port 3000")
})