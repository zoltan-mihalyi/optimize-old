var assert = require('assert');
var Helper = require('./Helper');

describe('Inline expression', function() {
    it('should inline expression', function() {
        Helper.assertMatch('InlineExpression');
    });
});