var Helper = require('./Helper');

describe('Remove unused functions and variables', function() {
    describe('Remove functions and vars', function() {
        it('should remove unused and only self-referenced functions', function() {
            Helper.assertMatch('RemoveUnused');
        });
    });
});