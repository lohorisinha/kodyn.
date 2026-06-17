require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');
const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/auth/github/callback`
},
async (accessToken, refreshToken, profile, done) => {
    return done(null, {profile, accessToken}); // swap with github user data once supabase is working
}));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
app.get('/auth/github', passport.authenticate('github', {scope: ['user', 'repo']}));
app.get('/auth/github/callback',
    passport.authenticate('github', {failureRedirect: '/'}),
    (req, res) => {
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
);
app.get('/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({user: req.user.profile});
    } else {
        res.status(401).json({error: 'not logged in'});
    }
});
app.getMaxListeners('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect(process.env.CLIENT_URL);
    });
});
app.listen(3000, () => console.log('server running on port 3000'));