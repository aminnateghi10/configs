const app = require("express")();
const bodyParser = require("body-parser");
global.config = require("./modules/config");
const mongoose = require("mongoose");

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

const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {type: String, required: true}
})
const userModel = mongoose.model('admin', userSchema);

new userModel({
    name: 'amin'

}).save()
    .then(() => {
        console.log('User saved successfully');
    })
    .catch((err) => {
        console.error('Error saving user:', err);
    });

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({type: "application/json"}));

const apiRouter = require("./modules/routes/api");

app.use('/api', apiRouter);


app.listen(config.port, () => {
    console.log(`Server running at port ${config.port}`)
})
