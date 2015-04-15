/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */
"use strict";
var express = require("express");
var path = require("path");
var MongoClient = require("mongodb").MongoClient;
var bodyParser = require("body-parser");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var port = 3000;
var app = express();
var dbURL = "mongodb://localhost:27017/test";

var routes = require('./routes/index');
var users = require('./routes/users');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

module.exports = app;

function randomShorterUrl() {
    var temp = Date.now();
    return (temp.toString(36));

}

app.post("/", function(req, res) {
    var url = req.body.ogurl;
    var index = url.indexOf("localhost:3000");
    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            console.log("Error connecting to the database");
            res.status(404).send("Error connecting to the database");
        } else {
            var collection = db.collection("url", {
                capped: true,
                size: 100000
            });
            if (index > -1 && index < 9) {
                //shorturl
                collection.find({
                    shorturl: url
                }).toArray(function(err, items) {
                    res.json({
                        "url": items[0].longurl
                    });
                });
            } else {
                //longurl
                collection.find({
                    longurl: url
                }).toArray(function(err, items) {

                    if (items.length <= 0) {
                        console.log("New Entry");
                        //Generate new URL 
                        var shorturl = randomShorterUrl();
                        shorturl = "localhost:3000/" + shorturl;
                        //console.log(shorturl);
                        var urlDB = {
                            shorturl: shorturl,
                            longurl: url,
                            views: 1
                        };
                        collection.insert(urlDB, function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                res.json({
                                    "url": shorturl
                                });
                            }
                        });

                    } else {
                        //LongUrl already exist
                        res.json({
                            "url": items[0].shorturl
                        });
                    }
                });
            }
        }

    });
});


app.get("/top", function(req, res) {

    var url = req.params.url;
    url = "localhost:3000/" + url;
    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            console.log("Problem connecting database");
            res.status(404).send("Problem connecting database");
        } else {
            var collection = db.collection("url", {
                capped: true,
                size: 100000
            });
            collection.find().sort({
                views: -1
            }).limit(10).toArray(function(err, items) {
                res.json(items);

            });
        }
    });

});
app.route("/:url").all(function(req, res) {
    var url = req.params.url;
    url = "localhost:3000/" + url;
    MongoClient.connect(dbURL, function(err, db) {
        if (err) {
            console.log("Error connecting to the database");
            res.status(404).send("Error connecting to the database");
        } else {
            var collection = db.collection("url", {
                capped: true,
                size: 100000
            });
            collection.find({
                shorturl: url
            }).toArray(function(err, items) {
                if (items.length <= 0) {
                    res.status(404).send("uh oh, url does not Exist");
                } else {
                    collection.update({
                        shorturl: url
                    }, {
                        $inc: {
                            views: 1
                        }
                    });
                    res.redirect(items[0].longurl);
                }
            });

        }
    });
});
app.listen(port);
console.log("Listening on port " + port);