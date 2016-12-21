(function() {
    ({
        x: 1
    }).y = 2;;

    {
        var i = "x";
        console.log("x", 1);
    }

    {
        var i = "y";
        console.log("y", 2);
    }

    console.log(i);
})();

(function() {
    {
        console.log("x", 1);
    }

    {
        console.log("y", 2);
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
    {
        console.log("0", 1);
    }

    {
        console.log("1", 2);
    }
})();