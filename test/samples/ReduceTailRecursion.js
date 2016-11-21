function factorial(i, prod) {
    if (i === 0) {
        return prod;
    } else {
        return factorial(i - 1, prod * i);
    }
}

factorial(3, 1);

function noParam() {
    return noParam();
}
noParam();

function cannotReduce() {
    cannotReduceInner();
    function cannotReduceInner() {
        return cannotReduce();
    }
}
cannotReduce();