require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const session = require('express-session');
const {passport} = require('./passport'); // Import the Passport configuration from passport.js
const apiRouter = require('./routes'); // Import the server routes from routes.js
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 300000000 },
    })
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', apiRouter); // Use the server routes defined in routes.js

app.listen(PORT, () => {
    console.log(`Starting up server on ${PORT}`);
});
