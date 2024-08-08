const BaseController = require('./base');
const { config } = require('hmpo-app');

class Eligible extends BaseController {

    locals(req, res) {
        return {
            ...super.locals(req, res),
            cost: config.get(`costs.${req.sessionModel.get('ageGroup')}`)
        };
    }

}

module.exports = Eligible;
