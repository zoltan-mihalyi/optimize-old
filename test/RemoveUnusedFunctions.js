var Helper = require('./Helper');

describe('Remove unused functions', function() {
    describe('Remove functions', function() {
        it('should remove unused and only self-referenced functions', function() {
            Helper.assertMatch('RemoveUnusedFunctions');
        });
    });
});