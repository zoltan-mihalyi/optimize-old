(function() {
    var x;
    x = u();
    console.log(x)

    var y;
    y = u();
    console.log(y)

    var z = u();
    z++;
    console.log(z)
})();

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