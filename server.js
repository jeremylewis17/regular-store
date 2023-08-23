const express = require('express');
const session = require('express-session');
const passport = require('./passport'); // Import the Passport configuration from passport.js
const routes = require('./routes'); // Import the server routes from routes.js

const app = express();
const PORT = process.env.PORT || 4001;

app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 300000000, secure: true },
    })
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes); // Use the server routes defined in routes.js

app.listen(PORT, () => {
    console.log(`Starting up server on ${PORT}`);
});
