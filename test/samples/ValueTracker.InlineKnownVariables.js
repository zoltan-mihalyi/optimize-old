(function() {
    var w = 2;
    var x = 2;
    var y = 2;
    var z = 2;
    b();
    c();
    console.log(w);
    console.log(x);
    console.log(y);
    console.log(z);
    while (u) {
        console.log(z);
    }
    u.z = 42;
    u.z++;
    console.log(u.z)
    console.log(z)

    function b() {
        u || x++;
    }

    c = () => {
        w = 3;
    };

    (function() {
        y = 3;
    })

    var a = 2;
    (function() {
        console.log(a);
    })();
})();

(function() {
    var a1 = setInterval(function() {
        console.log(a1);
        console.log(a2);
        console.log(a3);
    });
    var a2;
    var a3 = 1;
    a2 = setInterval(function() {
        console.log(a1);
        console.log(a2);
        console.log(a3);
    });

    var b = 1;
    console.log(getB());
    b = 2;

    function getB() {
        return b;
    }

    var x = 1;
    for (var i = 0; i < 10; i++) {
        x++;
    }
    if (x) {
        console.log(x);
    }
    x = 2;
    while (u) {
        console.log(x);
        x--;
    }
    console.log(x > 0);

    x = 1;
    for (var i of []) {
        x++;
        console.log(i);
    }

    for (var j in u) {
        console.log(j);
    }

    console.log(x < 5);
})();