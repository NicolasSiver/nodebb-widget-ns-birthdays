(function (Job) {

    var async = require('async');

    var nodebb = require('./nodebb'),
        db     = nodebb.db,
        user   = nodebb.user;

    var checking   = false,
        users      = null,
        checkStart = null,
        checkEnd   = null;

    Job.getUsers = function (done) {
        done(null, users);
    };

    Job.start = function (done) {
        if (checking) {
            return done(new Error('Job is in progress. You can not start another'));
        }

        checking = true;
        checkStart = Date.now();
        checkEnd = null;

        done(null);
    };

})(module.exports);