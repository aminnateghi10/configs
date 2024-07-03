const app = require("express")();
const bodyParser = require("body-parser");
global.config = require("./modules/config");
const mongoose = require("mongoose");
const botMiddleware = require("./modules/routes/bot");

// Connect to DB
mongoose.connect("mongodb://localhost:27017/configs", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

mongoose.Promise = config.Promise;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({type: "application/json"}));
const apiRouter = require("./modules/routes/api/v1");

app.use('/api/v1', apiRouter);
// login to site

app.listen(config.port, () => {
    console.log(`Server running at port ${config.port}`)
})
