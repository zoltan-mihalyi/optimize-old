var assert = require('assert');
var first = require('../dist/first');

describe('First', function() {
    describe('first', function() {
        it('should return 2', function() {
            assert.equal(2, first());
        });
    });
});