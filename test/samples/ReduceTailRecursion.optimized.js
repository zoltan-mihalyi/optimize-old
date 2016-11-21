function factorial(i, prod) {
    x:
    while (1) {
        if (i === 0) {
            return prod;
        } else {
            var new_i = i - 1, new_prod = prod * i;
            i = new_i;
            prod = new_prod;
            continue x;
        }
        return;
    }
}

factorial(3, 1);

function noParam() {
    x:
    while (1) {
        continue x;
        return;
    }
}
noParam();

function cannotReduce() {
    cannotReduceInner();
    function cannotReduceInner() {
        return cannotReduce();
    }
}
cannotReduce();