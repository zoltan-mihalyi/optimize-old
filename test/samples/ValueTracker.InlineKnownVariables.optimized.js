(function() {
    var v = /a/g;

    function isV(p) {
        return p === v;
    }

    console.log(true);
    console.log(isV(v));

    var w = 2;
    var x = 2;
    var y = 2;
    b();
    c();
    console.log(w);
    console.log(x);
    console.log(y);
    console.log(2);
    while (u) {
        console.log(2);
    }
    u.z = 42;
    u.z++;
    console.log(u.z)
    console.log(2)
    console.log(2)

    function b() {
        u || x++;
    }

    c = () => {
        w = 3;
    };

    (function() {
        y = 3;
    })
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

    console.log(getB());
    var b = 1;

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

    var z;
    if (u()) {
        z = 1
    } else {
        console.log(z);
    }
    console.log(z);

    var a = 1;
    switch (u) {
        case 1:
            a = 2;
            break;
        case 2:
            console.log(a);
            a = 3;
        case 3:
            console.log(a);
    }
    console.log(a);

    return {
        y: 1
    }
})();

(function() {
    {
        let j = u();
        console.log(j, j);
    }
    console.log(1);
})();

var Reflect;
console.log(Reflect);

var Reflect2 = 1;
console.log(1);