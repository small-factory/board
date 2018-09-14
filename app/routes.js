
const path = require('path');
const csvtojsonV2=require("csvtojson/v2");
var mv = require('mv');
const api = require('./models/api');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const schedule = require('node-schedule');

// (api.Schedule).find({}, function(err, tasks) {
//     if (err) console.log(err)

//     tasks.forEach((task) => {
//         var date = new Date(task.date);
//         schedule.scheduleJob(date, function(){
//             console.log('execute task');
//         });

//     })
// })
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
            res.render('realtor.ejs', {
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


    app.get('/users', isLoggedIn, function(req, res) {
        res.render('users.ejs', {
            user : req.user
        });
    });

    app.get('/myProspects', isLoggedIn, function(req,res) {
        //(api.Prospect).find({realtorId: req.user._id}, function(err, prospects) {
        (api.Prospect).find({}, function(err, prospects) {
            if (err) console.log(err);
            res.send(prospects);
        })
    })

    app.post('/addProspect', isLoggedIn, function(req, res) {
        console.log(req.body);
        var newProspect = new (api.Prospect)(req.body);
        newProspect.save(function (err, results) {
            if (err) console.log(err);
            console.log(results);
            res.json(results);
        })
    })
    app.get('/myGroups', (req,res) => {
        (api.Group).find({}, function(err, resp) {
            if (err) console.log(err)
            console.log('groups', resp)
            res.json(resp);
        })
    })
    app.post('/addGroup', (req, res) => {
        console.log(req.body);
        req.body.owner = req.user._id
        var newGroup = new (api.Group)(req.body);
        newGroup.save(function(error, result) { 
            if (error) {
              console.log('err', error)
            }
            res.json({message: 'successful!'})
            console.log(result);
           });
        console.log('got it', req.body)
    })
    app.post('/updateGroup/:id', (req, res) => {
        (api.Group).findByIdAndUpdate(req.params.id,{$set:{name:req.body.name, prospects: req.body.prospects}},{new:true}, function(err, results) {
            if (err) {
                console.log('error', err)
                res.status(400).json({err})
            } else {
                res.json(results);
            }

        })       
    })
    app.delete('/deleteGroup', (req,res) => {
        console.log(req.body);
        (api.Group).findByIdAndRemove({_id: req.body.id}, req.body, function(err,data) {
            if(!err){
                console.log("Deleted", data);
            } else {
                console.log('error', err)
            }
        });
    })

    app.get('/campaigns', isLoggedIn, function(req, res) {
        res.render('campaigns.ejs', {
            user : req.user
        });
    });

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


    // CSV UPLOAD

    
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


  app.post('/sendEmail', function(req, res) {
      console.log('send this email', req.body)
    const msg = {
        to: req.body.toAddress,
        from: req.body.fromAddress,
        subject: req.body.subject,
        text: req.body.plainText,
        html: req.body.emailBody,
      };
      sgMail.send(msg);
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
