(function() {
    let obj = {x: 1};
    obj.y = 2;
    for (var i in obj) {
        console.log(i, obj[i]);
    }
    console.log(i);
})();

(function() {
    var i;
    let obj = {x: 1, y: 2};
    for (i in obj)
        console.log(i, obj[i]);
})();

(function() {
    let obj = {x: 1, y: 2};
    for (const i in obj) {
        console.log(i, obj[i]);
    }
    console.log(i);
})();

(function() {
    let obj = {x: 1};
    setY(obj, 2);

    for (const i in obj) {
        console.log(i, obj[i]);
    }
})();

(function() {
    let obj = [1, 2];

    for (const i in obj) {
        console.log(i, obj[i]);
    }
})();