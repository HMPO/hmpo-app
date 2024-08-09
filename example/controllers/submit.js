const BaseController = require('./base');
const SubmissionModel = require('../models/submission');
const logger = require('hmpo-app').logger.get();

class Submit extends BaseController {

    // Part of the POST lifecycle
    saveValues(req, res, next) {
        super.saveValues(req, res, () => {
            const submissionModel = new SubmissionModel(null, req.modelOptions());

            submissionModel.set(req.sessionModel.toJSON());

            submissionModel.save((err, res) => {
                if (err) return next(err);

                const { reference } = res;

                req.sessionModel.set('reference', reference);

                logger.info('Submission successful', {
                    req,
                    reference
                });

                next();
            });

        });
    }

}

module.exports = Submit;
