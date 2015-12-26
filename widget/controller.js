(function (Controller) {

    var async   = require('async'),
        CronJob = require('cron').CronJob,
        fs      = require('fs'),
        moment  = require('moment'),
        path    = require('path');

    var job         = require('./job'),
        logger      = require('./logger'),
        nodebb      = require('./nodebb'),
        nconf       = nodebb.nconf,
        templatesJs = nodebb.templates,
        Templates   = require('./templates');

    var app       = null,
        cronJob   = null,
        templates = null;

    Controller.disposeJobs = function (done) {
        if (cronJob !== null) {
            logger.log('warn', 'Cron Job is disposed');
            cronJob.stop();
            cronJob = null;
        }
        done(null);
    };

    Controller.getWidgets = function (widgets, done) {
        widgets.push({
            name       : 'Birthdays',
            widget     : 'ns_birthdays',
            description: "Efficient widget to output all today's birthdays of community members.",
            content    : templates[Templates.SETTINGS].data
        });

        done(null, widgets);
    };

    Controller.loadTemplates = function (done) {
        if (templates !== null) {
            logger.log('warn', 'Templates are already loaded');
            return done(null);
        }

        templates = {};
        templates[Templates.SETTINGS] = {uri: 'widgets/birthdays/settings.tpl', data: undefined};
        templates[Templates.VIEW] = {uri: 'widgets/birthdays/view.tpl', data: undefined};

        async.each(Object.keys(templates), function (name, next) {
            var template = templates[name];
            fs.readFile(path.resolve(__dirname, '../public/templates', template.uri), function (error, content) {
                if (error) {
                    logger.log('error', 'Template Error has occurred, message: %s', error.message);
                    return next(error);
                }
                template.data = content.toString();
                logger.log('verbose', 'Widget Template "%s" is loaded', name);
                next(null);
            });
        }, done);
    };

    Controller.renderWidget = function (widget, done) {
        var showAge = widget.data.showAge;

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
                if (!showAge) {
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
                next(null, templatesJs.parse(templates[Templates.VIEW].data, data));
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
