function a() {
    var w = 2;
    var x = 2;
    var y = 2;
    var z = 2;
    b();
    c();
    console.log(w);
    console.log(x);
    console.log(y);
    console.log(2);

    function b() {
        u || x++;
    }

    c = ()=> {
        w = 3;
    };

    (function() {
        y = 3;
    })
}
a();

function b() {
    var x = 1, y = z, z = 1;
    console.log(1);

    u || (x = 2);
    console.log(x);

    x *= 3;
    console.log(x);

    x = 3;
    console.log(3);

    x++;
    x = 8;
    console.log(8);

    console.log(q);
    var q = 2;
}
b();

function c() {
    var x = 1;
    var y = 1;
    if (u) {
        x = '1'
        y++;
    }
    console.log("1");
    console.log(y);
    console.log(void 0);
    console.log(2);
}
c();

function d() {
    var x = 1;
    for (var i = 0; i < 10; i++) {
        x++;
    }
    if (x) {
        console.log(x);
    }
    x = 2;
    while (u) {
        x--;
    }
    console.log(x > 0);

    x = 1;
    for (var i of []) {
        x++;
    }

    console.log(x < 5);
}
d();

function e() {
    var x = 31;
    var y = 42;

    while (u) {
        console.log(x);
        console.log(42);
        x++;
    }
}
e();

function f() {
    var y;
    console.log(void 0);
    console.log(u);
    var x = 1;
    u.x = 1;
    u.y++
    console.log(u.x);
    x += [];
    console.log(x);
}
f();