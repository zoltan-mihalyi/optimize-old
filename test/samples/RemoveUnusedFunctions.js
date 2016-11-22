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

    function sameAsMethod(){
    }

    window.sameAsMethod();

    (function() {
        function fn() {
        }

        window.fn();
    })();

    var x = console.log('x');

    var y;
})();

var global;

function globalFn() {
}