(function (Job) {

    var async = require('async');

    var logger = require('./logger'),
        nodebb = require('./nodebb'),
        db     = nodebb.db;

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

        async.waterfall([
            async.apply(db.getObjectField, 'global', 'userCount'),
            function (usersCount, callback) {
                var birthdays      = [],
                    today          = new Date(),
                    userBundleSize = 100,
                    index          = 0,
                    sortBy         = 'users:joindate';

                logger.log('verbose', 'Users to process: %d', usersCount);

                async.doWhilst(function process(nextBundle) {
                    async.waterfall([
                        async.apply(db.getSortedSetRevRange, sortBy, index, getLimit(index, userBundleSize, usersCount)),
                        function getUsers(uids, next) {
                            db.getObjects(uids.map(function (uid) {
                                return 'user:' + uid;
                            }), function (error, usersList) {
                                var i = 0, len = usersList.length, userEntity, birthday;
                                for (i; i < len; ++i) {
                                    userEntity = usersList[i];
                                    if (userEntity.birthday) {
                                        birthday = new Date(userEntity.birthday);
                                        if (today.getDate() === birthday.getDate()
                                            && today.getMonth() === birthday.getMonth()) {
                                            birthdays.push(userEntity);
                                        }
                                    }
                                }
                                next(null);
                            });
                        },
                        function increase(next) {
                            index += userBundleSize;
                            next(null);
                        }
                    ], nextBundle);
                }, function test() {
                    return index < usersCount;
                }, function (error) {
                    if (error) {
                        return callback(error);
                    }
                    callback(null, birthdays);
                });
            }
        ], function (error, result) {
            checking = false;
            checkEnd = Date.now();

            if (error) {
                return done(error);
            }

            users = result;
            done(null, result);
        });
    };

    function getLimit(index, step, total) {
        var limit = index + step - 1;
        return (limit >= total) ? total - 1 : limit;
    }

})(module.exports);
