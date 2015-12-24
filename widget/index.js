(function (Widget) {
    'use strict';

    var async = require('async');

    var job    = require('./job'),
        logger = require('./logger');

    Widget.hooks = {
        statics: {
            load: function (params, callback) {
                async.series([
                    function initialJob(next) {
                        // Postpone initial Job,
                        // we already have to much stuff to do at forum's boot stage
                        setTimeout(function defer() {
                            job.start(function (error, users) {
                                if (error) {
                                    return logger.log('error', 'Initial error has occurred. %s', error);
                                }
                                logger.log('verbose', 'Initial job is finished, birthdays: %d', users.length);
                            });
                        }, 500 + Math.random() * 2500);
                        next(null);
                    }
                ], function (error) {
                    if (error) {
                        return callback(error);
                    }
                    logger.log('verbose', 'Widget is initiated successfully');
                    callback(null);
                });
            }
        }
    };

})(module.exports);
