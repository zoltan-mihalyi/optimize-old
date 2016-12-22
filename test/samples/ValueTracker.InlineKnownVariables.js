(function() {
    var v = /a/g;

    function isV(p) {
        return p === v;
    }

    console.log(v === v);
    console.log(isV(v));

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
    var z;
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

    var y = "abc";
    return {
        y: 1
    }

})();

(function() {
    var r = /a/;
    r.x = 1;
    console.log(r.x);
})();

(function() {
    {
        var i = 1;
        let j = u();
        console.log(j, j);
    }
    console.log(i);
})();

var Reflect;
console.log(Reflect);

var Reflect2 = 1;
console.log(Reflect2);