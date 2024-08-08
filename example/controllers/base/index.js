const DateController = require('./date');

class Base extends DateController {}

Base.validators = Object.assign(Base.validators, require('./validators'));
Base.formatters = Object.assign(Base.formatters, require('./formatters'));

module.exports = Base;
