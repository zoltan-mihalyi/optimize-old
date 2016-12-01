var Helper = require('./Helper');

describe('Inline known variables', function() {
    it('should inline known variables', function() {
        Helper.assertMatch('ValueTracker.InlineKnownVariables');
    });

    it('should track value changes', function() {
        Helper.assertMatch('ValueTracker.TrackValueChanges');
    });

    it('should handle block scoped variables', function() {
        Helper.assertMatch('ValueTracker.HandleBlockScoped');
    });

    it('should track possible values', function() {
        Helper.assertMatch('ValueTracker.TrackPossibleValues');
    });

    it('should remove unused declarations and assignments', function() {
        Helper.assertMatch('ValueTracker.RemoveUnused');
    });
});