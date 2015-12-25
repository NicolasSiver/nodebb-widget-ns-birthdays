(function (Controller) {

    var CronJob = require('cron').CronJob;

    var job    = require('./job'),
        logger = require('./logger');

    var cronJob = null;

    Controller.disposeJobs = function (done) {
        if(cronJob !== null){
            logger.log('warn', 'Cron Job is disposed');
            cronJob.stop();
            cronJob = null;
        }
        done(null);
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
