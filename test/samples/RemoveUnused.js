(function() {
    function unused() {
    }

    function used() {
    }

    used();

    usedBeforeDeclaration();

    function usedBeforeDeclaration() {
    }

    function recursive() {
        recursive();
    }

    (function immediatelyInvoked() {
    })();

    function sameAsMethod() {
    }

    window.sameAsMethod();

    (function() {
        function fn() {
        }

        window.fn();
    })();

    let a = u(), b = u(), c = a;
    var x = console.log('x');

    var y;

    var d = {};

    console.log(()=>{
        d.x
    });
})();

var global;

function globalFn() {
}