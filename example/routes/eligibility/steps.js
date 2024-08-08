module.exports = {
    '/': {
        entryPoint: true,
        resetJourney: true,
        skip: true,
        next: 'uk'
    },
    '/uk': {
        fields: ['uk'],
        next: [
            // Conditional routing
            { field: 'uk', value: false, next: 'ineligible' },
            'date-of-birth'
        ]
    },
    '/date-of-birth': {
        controller: require('../../controllers/date-of-birth'),
        fields: ['dateOfBirth'],
        // Step is editable from the check your answers page
        editable: true,
        next: 'eligible'
    },
    '/eligible': {
        controller: require('../../controllers/eligible'),
        next: '/apply'
    },

    '/ineligible': {}
};
