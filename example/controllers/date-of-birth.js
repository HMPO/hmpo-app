const BaseController = require('./base');
const { config } = require('hmpo-app');
const moment = require('moment');

class DateOfBirth extends BaseController {

    // Part of the POST lifecycle
    saveValues(req, res, next) {
        super.saveValues(req, res, () => {
            const adultDate = moment().subtract(config.get('adultYears'), 'years');
            const isChild = moment(req.sessionModel.get('dateOfBirth')).isAfter(adultDate);
            req.sessionModel.set('ageGroup', isChild ? 'CHILD' : 'ADULT');

            next();
        });
    }

}

module.exports = DateOfBirth;
