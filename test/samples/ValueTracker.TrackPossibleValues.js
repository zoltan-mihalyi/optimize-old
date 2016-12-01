(function() {
    var x = 1;
    var y = 1;
    if (u) {
        x = '1'
        y++;
    }
    if (x) {
        console.log(x + '');
    }
    console.log(y);
    console.log(void y);
    y || console.log(1);
    y && console.log(2);
})();