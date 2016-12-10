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