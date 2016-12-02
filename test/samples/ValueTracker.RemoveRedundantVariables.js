(function() {
    function fn() {
    }

    var xx = u(), x = u();
    var y = x, yy = xx;
    console.log(y, yy);

    var z = u();
    fn(z, 2);

    var a = u();
    fn(a);
    fn(a);

    var result = [1, 2, 3];
    return result;

})();