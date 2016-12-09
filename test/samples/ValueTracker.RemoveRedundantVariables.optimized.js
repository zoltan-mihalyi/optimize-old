(function() {
    function fn() {
    }

    var x1 = u();
    fn(u(), x1);
})();

(function() {
    function fn() {
    }

    fn(u(), 2);

    var y = u();
    fn(y);
    fn(y);
})();

(function() {
    [] + u();

    var y2 = [];
    u() + y2;
})();

(function() {
    u() || u();
})();

(function() {
    u().toString();
})();

(function() {
    u()();
})();

(function() {
    return u();
})();

(function() {
    +u();
})();

(function() {
    var y = 1;
    if (u()) {
        y = u();;
    }
    console.log(y);
})();

(function() {
    u().name = 'a';;
})();

(function() {
    if (u()) {
        return 1;
    }

    var y = u();
    var z = u();
    if (y) {
        return z;
    }
})();

(function() {
    return [1, u()];
})();

(function() {
    for (var i = u(); i < 10; i++) {
    }

    var y = u();
    for (; y < 10; i++) {
    }
})();

(function() {
    for (var i in u()) {
    }
})();

(function() {
    for (var i of u()) {
    }
})();

(function() {
    (u() ? u() : u());
})();

(function() {
    var a = u();
    var x = u();
    a ? x : u();
})();

(function() {
    return {
        a: u()
    };
})();