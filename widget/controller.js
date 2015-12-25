(function (Controller) {

    var async   = require('async'),
        CronJob = require('cron').CronJob,
        fs      = require('fs'),
        path    = require('path');

    var job       = require('./job'),
        logger    = require('./logger'),
        Templates = require('./templates');

    var cronJob   = null,
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

    Controller.setupCron = function (done) {
        if (cronJob !== null) {
            logger.log('warn', 'Cron Job is installed already');
            return done(null);
        }

        // Runs every day
        // at 00:08 AM
        cronJob = new CronJob('00 48 8 * * *', function () {
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
