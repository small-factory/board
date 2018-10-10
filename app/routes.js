
const path = require('path');
const csvtojsonV2=require("csvtojson/v2");
var mv = require('mv');
const api = require('./models/api');
var bcrypt   = require('bcrypt-nodejs');

var generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

     app.get('/profile', isLoggedIn, function(req, res) {
         console.log(req.user.local.group)
        if (req.user.group === 1) {
            res.render('admin.ejs', {
                user : req.user
            });
        } else if (req.user.group === 3) {
            res.render('teacher.ejs', {
                user : req.user,
                name: req.user.name
            });
        } else if (req.user.group === 5) {
                res.render('student.ejs', {
                    user : req.user,
                    name: req.user.name
                });
        } else {
            res.render('profile.ejs', {
                user : req.user
            });
        }
        
    });

    app.get('/create-board', isLoggedIn, function(req, res) {
        if (req.user.group !== 1 && req.user.group !== 3) {
            res.send('unauthorized');
        } else {
            res.render('create-board.ejs', {
                user: req.user,
                name: req.user.name
            })
        }
    });

    app.get('/boards', isLoggedIn, function(req, res) {
        if (req.user.group !== 1 && req.user.group !== 3) {
            res.send('unauthorized');
        } else {
            res.render('boards.ejs', {
                user: req.user,
                name: req.user.name
            })
        }
    });

    app.get('/admin/students', isAdmin, function(req, res) {
        res.render('admin/students.ejs', {
            user : req.user
        });
    })

    app.get('/admin/boards', isAdmin, function(req, res) {
        res.render('admin/boards.ejs', {
            user : req.user
        });
    })

    

    app.get('/admin/teachers', isAdmin, function(req, res) {
        res.render('admin/teachers.ejs', {
            user : req.user
        });
    })
    
    app.get('/allTeachers', function(req,res) {
        (api.User1).find({group: 3}, function(err, teachers) {
            if (err) console.log(err);
            res.send(teachers);
        })
    })

    app.post('/addTeacher', function(req, res) {
        console.log(req.body);
        var passwordHashed = req.body.local.password;
        delete req.body.local.password
        req.body.local.password = generateHash(passwordHashed);
        var newTeacher = new (api.User1)(req.body);
        newTeacher.save(function (err, results) {
            if (err) console.log(err);
            console.log(results);
            res.json(results);
        })
    })

    app.post('/addStudent', function(req, res) {
        var passwordHashed = req.body.local.password;
        delete req.body.local.password
        req.body.local.password = generateHash(passwordHashed);
        var newStudent = new (api.User1)(req.body);
        newStudent.save(function (err, results) {
            if (err) console.log(err);
            console.log(results);
            res.json(results);
        })
    })

    app.get('/allProjects', isLoggedIn, function(req,res) {
        (api.Project).find({}, function(err, projects) {
            if (err) console.log(err);
            res.send(projects);
        })
    })
    
    app.get('/allStudents', function(req,res) {
        (api.User1).find({group: 5}, function(err, students) {
            if (err) console.log(err);
            res.send(students);
        })
    })


    app.get('/activity', isLoggedIn, function(req, res) {
        res.render('activity.ejs', {
            user : req.user
        });
    });

    app.get('/assets', isLoggedIn, function(req, res) {
        res.render('assets.ejs', {
            user : req.user
        });
    });



    
  app.post('/uploadCsv', function(req, res) {
    if (!req.files)
      return res.status(400).send('No files were uploaded.');
      
    let sampleFile = req.files.sampleFile;
    const stringVersion = (sampleFile.data).toString('utf8');
    console.log(stringVersion)
      csvtojsonV2()
      .fromString(stringVersion)
      .then((jsonObj)=>{
          console.log('csv to json result: ',jsonObj);
          var newProspect = new (api.Prospect)(jsonObj);
          newProspect.save(function (err, results) {
              if (err) console.log(err);
              console.log(results);
              res.json(results);
          })
      })
      .catch((err)=> {
          console.log('err', err);
          reject('err', err);
      })
        
      
  });


  
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
            failureRedirect : '/', // redirect back to the signup page if there is an error
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
            successRedirect : '/admin/teachers', // redirect to the secure profile section
            failureRedirect : '/admin/teachers', // redirect back to the signup page if there is an error
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
