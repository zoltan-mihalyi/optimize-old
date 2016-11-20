function a() {
    var x = 2;
    var y = 2;
    var z = 2;
    b();
    console.log(x);
    console.log(y);
    console.log(z);

    function b() {
        y = 3;
        u || x++;
    }
}
a();

function b() {
    var x = 1, y = z, z = x;
    console.log(x);

    u || (x = 2);
    console.log(x);

    x *= 3;
    console.log(x);

    x = 3;
    console.log(x);

    x++;
    x = x * 2;
    console.log(x);

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
    if (x) {
        console.log(x + '');
    }
    console.log(y);
    console.log(void y);
    y || console.log(1);
    y && console.log(2);
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