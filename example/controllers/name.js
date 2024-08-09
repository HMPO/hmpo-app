const BaseController = require('./base');

class Name extends BaseController {

    middlewareSetup() {
        super.middlewareSetup();
        this.use(this.setAdultOrChildTitles);
    }

    setAdultOrChildTitles(req, res, next) {
        req.form.options.fields.title.items = req.sessionModel.get('ageGroup') === 'CHILD' ?
            req.form.options.fields.title.childTitles :
            req.form.options.fields.title.adultTitles;

        next();
    }

}

module.exports = Name;
