(function() {
    var x = 1;
    console.log(1);

    u || (x = 2);
    console.log(x);

    x *= 3;
    console.log(x);

    console.log(3);

    console.log(8);

    console.log(void 0);

    var r = 1;
    r += [];
    console.log(r);

    if (u) {
        r = 2;
        console.log(2);
    }
    console.log(r);
})();