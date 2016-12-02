(function() {
    function fn() {
    }

    var xx = u();
    var y = u(), yy = xx;
    console.log(y, yy);

    fn(u(), 2);

    var a = u();
    fn(a);
    fn(a);

    return [1, 2, 3];
})();