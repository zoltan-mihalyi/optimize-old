function a() {
    var x = 2;
    b();
    console.log(x);

    function b() {
        x++;
    }
}
a();

function b() {
    var x = 1, y = z, z = 1;
    console.log(1);

    u || (x = 2);
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