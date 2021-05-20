
const HmpoFormWizard = require('hmpo-form-wizard');
const { setup } = require('hmpo-app');
const { router } = setup({ config: { APP_ROOT: __dirname } });


const steps = {
    '/': {
        entryPoint: true,
        fields: [ 'fieldName' ],
        next: 'done'
    },
    '/done': {}
};

const fields = {
    'fieldName': {
        validate: [ 'required' ]
    }
};

const wizard = new HmpoFormWizard(steps, fields, {
    name: 'example-form-name'
});

router.use('/', wizard);
