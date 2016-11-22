(function() {
    function used() {
    }

    used();

    usedBeforeDeclaration();

    function usedBeforeDeclaration() {
    }

    (function immediatelyInvoked() {
    })();

    window.sameAsMethod();

    (function() {
        window.fn();
    })();

    var x = console.log('x');
})();

var global;

function globalFn() {
}