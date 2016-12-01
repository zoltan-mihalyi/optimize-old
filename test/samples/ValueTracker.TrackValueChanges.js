(function() {
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

    var r = 1;
    r += [];
    console.log(r);

    if (u) {
        r = 2;
        console.log(r);
    }
    console.log(r);
})();