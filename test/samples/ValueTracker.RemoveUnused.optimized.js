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

    var a = u();
    console.log(u[a]);
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

    console.log(() => {
        d.x
    });
})();

var global;

function globalFn() {
}

function on() {
    var origFn, type;

    for (type in u()) {
    }

    return function() {
        return origFn;
    };
}
on();

(function() {
    var i;

    for (i = 0; i < 10; i++) {
    }
})()

(function() {
    var axa;
    if (u()) {
        axa = u();
        for (; axa;) {
        }
    }
})();

(function() {
    var x;
    try {
        x = u();
    } catch (e) {
        x = 1;
    }
    return x;
})();