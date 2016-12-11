(function() {
    console.log(1);
    console.log(1);

    if (u()) {}
    console.log("number");
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

    console.log("number");

    if (u()) {
        i = 'z';
    }
    console.log(typeof obj[i]);
})();

(function() {
    var obj = {
        x: 1
    };
    obj.x = 2;
    if (u()) {
        obj.x = 3;
    }
    console.log(true);
})();

(function() {
    var obj = {
        x: 1,
        y: 2
    };
    if (u()) {
        obj = {
            x: 0,
            y: 1
        }
    }
    var p = 'x';
    if (u()) {
        p = 'y';
    }

    var v = 3;
    if (u()) {
        v = 4;
    }
    obj[p] = v;
    console.log(true);
})();

(function() {
    var i = 1;
    if (u) {
        i = 2;
    }
    i.x = 2;
    console.log(i);
    console.log(i.x);
    i.x++;
    console.log(i);
    console.log(i.x);
    i[{}]++;

    var obj = {
        x: 1,
        y: 2
    };
    obj.z++;

    var p = 'x';
    if (u()) {
        p = 'y';
    }
    obj[p]++;

    console.log(obj.x);
    console.log(obj.y);
    console.log(obj.x >= 2);
    console.log(obj.y <= 2);
    console.log(true);
    console.log(true);
    obj[{}] = 1;
    var obj2 = {x: 1};
    obj2.y++;
    obj2[{}]++;
})();