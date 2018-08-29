const api = require('./models/api');

module.exports = function(app, passport) {

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
     app.get('/profile', isLoggedIn, function(req, res) {
         console.log(req.user.local.group)
        if (req.user.group === 1) {
            res.render('admin.ejs', {
                user : req.user
            });
        } else if (req.user.group === 3) {
            res.render('teacher.ejs', {
                user : req.user
            });
        } else {
            res.render('profile.ejs', {
                user : req.user
            });
        }
        
    });


    // ADMIN SECTION =========================
    app.get('/admin/brokerage', isAdmin, function(req, res) {
        res.render('admin/brokerage.ejs', {
            user : req.user
        });
    })

    app.post('/addBrokerage', isAdmin, function(req,res) {
        console.log('add brokerage', req.body);
        var newBrokerage = new (api.Brokerage)(req.body);
        newBrokerage.save(function (err, results) {
            if (err) console.log(err);
            console.log(results);
            res.json(results);
        })
    });

    app.get('/allBrokerages', function(req,res) {
        (api.Brokerage).find({}, function(err, brokerages) {
            if (err) console.log(err);
            res.send(brokerages);
        })
    })

    app.post('/updateBrokerage/:id', isAdmin, function(req,res) {
        console.log('update this brokerage', req.body);
        (api.Brokerage).findByIdAndUpdate(req.params.id, req.body, function (err, resp) {
            if (err) console.log(err);
            console.log(resp);
            res.json(resp);
         })
    })

    app.delete('/deleteBrokerage/:id', function(req,res) {
        (api.Brokerage).findByIdAndRemove(req.params.id, function (err, dist) {
            if (err) console.log(err);
            res.send(dist);
        })
    })





    app.get('/admin/realtors', isAdmin, function(req, res) {
        res.render('admin/realtor.ejs', {
            user : req.user
        });
    })
    app.get('/allRealtors', function(req,res) {
        (api.Realtor).find({group: 3}, function(err, teachers) {
            if (err) console.log(err);
            res.send(teachers);
        })
    })

    app.post('/addRealtor', function(req, res) {
        console.log(req.body);
        var newRealtor = new (api.Realtor)(req.body);
        newRealtor.save(function (err, results) {
            if (err) console.log(err);
            console.log(results);
            res.json(results);
        })
    })

    app.post('/updateRealtor/:id', isAdmin, function(req,res) {
        console.log('update this Realtor', req.body);
        (api.Realtor).findByIdAndUpdate(req.params.id, req.body, function (err, resp) {
            if (err) console.log(err);
            console.log(resp);
            res.json(resp);
         })
    })

    app.delete('/deleteRealtor/:id', function(req,res) {
        (api.Realtor).findByIdAndRemove(req.params.id, function (err, dist) {
            if (err) console.log(err);
            res.send(dist);
        })
    })

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
        // process the TEACHER signup
        app.post('/signupTeacher', passport.authenticate('local-signup', {
            successRedirect : '/admin/createTeacher', // redirect to the secure profile section
            failureRedirect : '/admin/createTeacher', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : ['public_profile', 'email'] }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });


};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.group === 1)
        return next();
    res.redirect('/');
}
