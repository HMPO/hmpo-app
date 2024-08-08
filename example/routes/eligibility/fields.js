module.exports = {
    uk: {
        journeyKey: 'application.uk',
        type: 'radios',
        formatter: 'boolean',
        validate: 'required'
    },
    dateOfBirth: {
        journeyKey: 'applicant.dateOfBirth',
        type: 'date',
        validate: [
            'required',
            'date'
        ],
        // Invalidate title choice if dateOfBirth is changed
        invalidates: ['title']
    },
    // Computed field based on dateOfBirth
    ageGroup: {
        journeyKey: 'applicant.ageGroup'
    },

    // Apply fields
    title: {
        journeyKey: 'applicant.title'
    }
};
