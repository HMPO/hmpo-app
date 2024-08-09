module.exports = {
    title: {
        journeyKey: 'applicant.title',
        type: 'radios',
        inline: true,
        validate: 'required',
        // Different options for adults and children
        adultTitles: ['Mr', 'Mrs', 'Miss', 'Ms', 'Other'],
        childTitles: ['Master', 'Miss', 'Other']
    },
    forenames: {
        type: 'text',
        validate: [
            'required',
            { type: 'maxlength', arguments: 30 },
            'alphaex1'
        ]
    },
    surname: {
        type: 'text',
        validate: [
            'required',
            { type: 'minlength', arguments: 2 },
            { type: 'maxlength', arguments: 30 },
            'alphaex1'
        ]
    },

    // Eligibility fields
    uk: {
        journeyKey: 'application.uk'
    },
    dateOfBirth: {
        journeyKey: 'applicant.dateOfBirth'
    },
    ageGroup: {
        journeyKey: 'applicant.ageGroup'
    }
};
