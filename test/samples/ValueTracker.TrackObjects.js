(function() {
    var obj = {
        x: 1
    };

    obj.y = 2;

    console.log(obj.x);
    console.log(obj.y);
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

(function() {
    var obj = {
        x: 1
    };
    obj.x = 2;
    if (u()) {
        obj.x = 3;
    }
    console.log(obj.x > 1);
})();

(function() {
    var obj1 = {
        x: 1
    };
    console.log(obj1.x);
    obj1.setX(2);
    console.log(obj1.x);

    var obj2 = {
        x: 1
    };
    console.log(obj2.x);
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
    console.log(obj4.x);
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
    console.log(obj.x >= 0);
})();

(function() {
    var arr = [1, 2];
    arr[0] = 1.1;
    console.log(arr.length);
    arr[2] = 4;
    console.log(arr.length);
    console.log(arr[0]);
    console.log(arr[1]);
    arr[u()] = 1;
    console.log(arr.length);
})();

(function() {
    var arr = [1, 2];
    arr.x = 'x';
    arr.length = 1;
    console.log(arr[0]);
    if (u()) {
        arr.length = 3;
    }
    console.log(arr.length);
    arr[3] = 4;
    console.log(arr.length);
    console.log(arr.x);
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
    console.log(arr.length);
    arr.length = 0.3;
    console.log(arr.length);
    arr.length = 'x';
    console.log(arr.length);
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
    console.log(obj.x >= 1);
    console.log(obj.y <= 3);
    obj[{}] = 1;
    var obj2 = {x: 1};
    obj2.y++;
    obj2[{}]++;
})();