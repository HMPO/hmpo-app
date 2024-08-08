const Model = require('hmpo-model');
const { config } = require('hmpo-app');

class Submission extends Model {

    url() {
        return config.get('services.submission.url');
    }

    prepare(cb) {
        super.prepare((_, data) => {
            cb(null, {
                timestamp: Date.now(),
                application: {
                    uk: data.uk,
                    applicant: {
                        dateOfBirth: data.dateOfBirth,
                        title: data.title,
                        name: {
                            forenames: data.forenames,
                            surname: data.surname
                        }
                    }
                }
            });
        });
    }

}

module.exports = Submission;
