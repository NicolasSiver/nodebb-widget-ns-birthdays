(function (Controller) {

    var async   = require('async'),
        CronJob = require('cron').CronJob,
        moment  = require('moment');

    var job    = require('./job'),
        nodebb = require('./nodebb'),
        nconf  = nodebb.nconf,
        logger = require('./logger');

    var app              = null,
        cronJob          = null,
        templateSettings = 'widgets/birthdays/settings',
        templateWidget   = 'widgets/birthdays/view';

    Controller.disposeJobs = function (done) {
        if (cronJob !== null) {
            logger.log('warn', 'Cron Job is disposed');
            cronJob.stop();
            cronJob = null;
        }
        done(null);
    };

    Controller.getWidgets = function (widgets, done) {
        async.waterfall([
            function (next) {
                app.render(templateSettings, {}, next);
            },
            function (templateHtml, next) {
                widgets.push({
                    name       : 'Birthdays',
                    widget     : 'ns_birthdays',
                    description: "Efficient widget to output all today's birthdays of community members.",
                    content    : templateHtml
                });
                next(null, widgets);
            }
        ], done);
    };

    Controller.renderWidget = function (widget, done) {
        var showAge = !!widget.data.showAge;

        async.waterfall([
            async.apply(job.getUsers),
            function format(users, next) {
                users = users || [];
                next(null, users.map(function (userData) {
                    return {
                        name    : userData.username,
                        birthday: userData.birthday,
                        userslug: userData.userslug
                    };
                }));
            },
            function findAge(users, next) {
                if (showAge === false) {
                    next(null, {users: users});
                } else {
                    var today = new Date();
                    next(null, {
                        users: users.map(function (userData) {
                            userData.age = moment(today).diff(new Date(userData.birthday), 'years');
                            return userData;
                        })
                    });
                }
            },
            function render(data, next) {
                data.relative_path = nconf.get('relative_path');
                app.render(templateWidget, data, next);
            },
            function (templateHtml, next) {
                widget.html = templateHtml;
                next(null, widget);
            }
        ], done);
    };

    Controller.setParams = function (params, done) {
        var router      = params.router,
            middleware  = params.middleware,
            controllers = params.controllers;

        app = params.app;
        done(null);
    };

    Controller.setupCron = function (done) {
        if (cronJob !== null) {
            logger.log('warn', 'Cron Job is installed already');
            return done(null);
        }

        // Runs every day
        // at 00:10 AM
        cronJob = new CronJob('00 10 0 * * *', function () {
                logger.log('verbose', 'Job is launched');
                job.start(function (error, users) {
                    if (error) {
                        return logger.log('error', '%s', error);
                    }
                    logger.log('verbose', 'Job is finished, birthdays: %d', users.length);
                });
            }, null, true
        );

        done(null);
    };

})(module.exports);
