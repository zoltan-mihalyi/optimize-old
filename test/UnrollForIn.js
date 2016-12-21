var Helper = require('./Helper');

describe('Unroll for-in loops', function() {
    it('should unroll for in loops', function() {
        Helper.assertMatch('UnrollForIn');
    });
});