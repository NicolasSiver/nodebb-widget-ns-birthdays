(function (Controller) {

    const meta = require.main.require('./src/meta');
    const user = require.main.require('./src/user');

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
        templateWidgetMo = 'widgets/birthdays/view_monthly';

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
        var showAge = !!widget.data.showAge,
            monthly = widget.data.monthly,
            lang = lang = 'en-GB',
            tformat = widget.data.tformat || 'LL';

        async.waterfall([
            function (next) {
                user.getSettings(widget.uid, next);
            },
            function (settings, next) {
                lang = settings.userLang || meta.config.defaultLang || lang;
                moment.locale(lang);
                next();
            },
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
                var today = new Date(),
                    data = [];
                users.forEach(function(userData, index) {
                    var bday = new Date(userData.birthday);
                    userData.bstr = moment(bday).format(tformat);
                    userData.today = false;
                    if (today.getDate() === bday.getDate() && today.getMonth() === bday.getMonth()) {
                        userData.today = true
                    }
                    if (showAge) {
                        userData.age = moment(today).endOf('month').diff(bday, 'years');
                    }
                    if (monthly || userData.today) {
                        data.push(userData);
                    }
                });
                next(null, {users: data });
            },
            function render(data, next) {
                data.relative_path = nconf.get('relative_path');
                if (monthly) {
                    data.users.sort(function(a,b) {
                      var x = a.birthday;
                      var y = b.birthday;
                      return x < y ? -1 : x > y ? 1 : 0;
                    });
                    app.render(templateWidgetMo, data, next);
                } else {
                    app.render(templateWidget, data, next);
                }
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
