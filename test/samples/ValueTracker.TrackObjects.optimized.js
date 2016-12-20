(function() {
    ({
        x: 1
    }).y = 2;;

    console.log(1);
    console.log(2);
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
    var obj1 = {
        x: 1
    };
    console.log(1);
    obj1.setX(2);
    console.log(obj1.x);

    var obj2 = {
        x: 1
    };
    console.log(1);
    setX(obj2, 2);
    console.log(obj2.x);

    var obj3 = {
        x: 1
    };
    console.log(obj3.x);
    setObj3X(2);
    console.log(obj3.x);

    function setObj3X(x) {
        obj3.x = x;
    }

    var obj4 = {
        x: 1,
        setX: function(x) {
            this.x = x;
        }
    };
    console.log(1);
    obj4.setX(2);
    console.log(obj4.x);
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
    var arr = [1, 2];
    arr[0] = 1.1;
    console.log(2);
    arr[2] = 4;
    console.log(3);
    console.log(1.1);
    console.log(2);
    arr[u()] = 1;
    console.log(arr.length);
})();

(function() {
    var arr = [1, 2];
    arr.x = 'x';
    arr.length = 1;
    console.log(1);
    if (u()) {
        arr.length = 3;
    }
    console.log(arr.length);
    arr[3] = 4;
    console.log(4);
    console.log("x");
    modify(arr);
    arr[0] = 1;
    console.log(arr.length);
})();

(function() {
    var arr = [];
    arr.length = u();
    console.log(arr.length);
    arr.length = 0;
    arr.length = {};
    console.log(typeof arr.length);
    console.log(arr.length);
    arr.length = '04';
    console.log(4);
    arr.length = 0.3;
    console.log(4);
    arr.length = 'x';
    console.log(4);
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