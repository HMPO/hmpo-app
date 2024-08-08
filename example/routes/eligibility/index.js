const hmpoFormWizard = require('hmpo-form-wizard');

const steps = require('./steps');
const fields = require('./fields');

module.exports = hmpoFormWizard(steps, fields, {
    name: 'eligibility',
    templatePath: 'pages/eligibility',
    controller: require('../../controllers/base')
});
