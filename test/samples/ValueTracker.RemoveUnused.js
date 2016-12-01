(function() {
    var x = 1;
    x = u();
    console.log(x)

    var y = 1;
    y = 2;
    y = u();
    console.log(y)

    var z = u();
    z++;
    console.log(z)
})();

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