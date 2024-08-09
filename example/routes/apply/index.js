const hmpoFormWizard = require('hmpo-form-wizard');

const steps = require('./steps');
const fields = require('./fields');

module.exports = hmpoFormWizard(steps, fields, {
    name: 'apply',
    templatePath: 'pages/apply',
    controller: require('../../controllers/base')
});
