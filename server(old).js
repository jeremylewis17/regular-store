const express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");
const store = new session.MemoryStore();
const bcrypt = require('bcrypt');


const app = express();
const PORT = process.env.PORT || 4001;


app.use(
    session({
      secret: "secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 300000000, secure: true }
    })
  );

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
  });

passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM users WHERE id =  ?', [ id ], (err, user) => {
        if (err) return done(err);
        done(null, user);
    });
  });



passport.use(new LocalStrategy(function verify(username, password, done) {
    db.get('SELECT * FROM users WHERE username = ?', [username], function (err, user) {
        if (err) {
            return done(err);
        }

        if (!user) {
            return done(null, false, { message: 'Incorrect username or password.' });
        }

        bcrypt.compare(password, user.hashed_password, function (err, result) {
            if (err) {
                return done(err);
            }
            if (!result) {
                return done(null, false, { message: 'Incorrect username or password.' });
            }
            return done(null, user);
        });
    });
}));



app.get('/login',
  function(req, res, next) {
    res.render('login');
  });

  app.post(
    '/login',
    passport.authenticate('local', {failureRedirect: '/login'}),
    (req, res) => {
      res.redirect('profile');
    }
  );


app.post('/register', (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, 10, function (err, hashedPassword) {
        if (err) {
            return res.status(500).send('Error hashing password');
        }

        db.run('INSERT INTO users (username, hashed_password) VALUES (?, ?)', [username, hashedPassword], function (err) {
            if (err) {
                return res.status(500).send('Error creating user');
            }

            res.redirect('/login');
        });
    });
});


app.listen(PORT, () =>{
    console.log(`Starting up server on ${PORT}`);
});



