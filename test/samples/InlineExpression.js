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
    var x = 1, y = z, z = x;
    console.log(x);

    false || (x = 2);
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