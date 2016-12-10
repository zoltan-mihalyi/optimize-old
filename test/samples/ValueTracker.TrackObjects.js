(function() {
    var obj = {
        x: 1
    };

    console.log(obj.x);
    console.log(obj['x']);

    if (u()) {
        obj = {
            x: 2
        }
    }
    console.log(typeof obj.x);
})();

(function() {
    var obj = {
        x: 1,
        y: 2
    };

    var i = 'x';
    if (u()) {
        i = 'y';
    }

    console.log(typeof obj[i]);

    if (u()) {
        i = 'z';
    }
    console.log(typeof obj[i]);
})();