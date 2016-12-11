(function() {
    function fn() {
    }

    var x1 = u(), x2 = u();
    var y1 = x2, y2 = x1;
    fn(y1, y2);
})();

(function() {
    function fn() {
    }

    var x = u();
    fn(x, 2);

    var y = u();
    fn(y);
    fn(y);
})();

(function() {
    var y = [];
    var x = u();
    y + x;

    var y2 = [];
    var x2 = u();
    x2 + y2;
})();

(function() {
    var x = u();
    x || u();
})();

(function() {
    var x = u();
    x.toString();
})();

(function() {
    var x = u();
    x();
})();

(function() {
    var x = u();
    return x;
})();

(function() {
    var x = u();
    +x;
})();

(function() {
    var y = 1;
    if (u()) {
        var x = u();
        y = x;
    }
    console.log(y);
})();

(function() {
    var x = u();
    x.name = 'a';
})();

(function() {
    var x = u();
    if (x) {
        return 1;
    }

    var y = u();
    var z = u();
    if (y) {
        return z;
    }
})();

(function() {
    var x = u();
    return [1, x];
})();

(function() {
    var x = u();
    for (var i = x; i < 10; i++) {
    }

    var y = u();
    for (; y < 10; i++) {
    }
})();

(function() {
    var x = u();
    for (var i in x) {
    }
})();

(function() {
    var x = u();
    for (var i of x) {
    }
})();

(function() {
    var x = u();
    x ? u() : u();
})();

(function() {
    var a = u();
    var x = u();
    a ? x : u();
})();

(function() {
    var x = u();
    return {
        a: x
    };
})();

(function() {
    var x = u();
    {
        return x + 1;
    }
})();

(function() {
    var x = u();
    try {
        return x + 1;
    } catch (e) {
    }
})();

(function() {
    var x = u();
    while (x) {
    }
})();

(function() {
    var x = u();
    do {
        return x;
    } while (x)
})();

(function() {
    var x = u();
    return x.y++;
})();