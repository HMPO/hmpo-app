module.exports = {
    '/': {
        skip: true,
        next: 'name'
    },
    '/name': {
        controller: require('../../controllers/name'),
        fields: ['title', 'forenames', 'surname'],
        editable: true,
        next: 'confirm'
    },
    '/confirm': {
        next: 'submit'
    },
    '/submit': {
        controller: require('../../controllers/submit'),
        next: 'done'
    },
    '/done': {
        backLink: false
    }
};
