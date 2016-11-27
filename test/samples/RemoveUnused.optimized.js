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

    u();
    u();
    console.log('x');

    var d = {};

    console.log(()=>{
        d.x
    });
})();

var global;

function globalFn() {
}