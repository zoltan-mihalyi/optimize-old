function used() {
}

used();

usedBeforeDeclaration();

function usedBeforeDeclaration() {
}

(function immediatelyInvoked() {
})();

function usedOnlyAsPropertyGlobal() {
}
window.usedOnlyAsPropertyGlobal();

(function() {
    window.fn();
})();

var x = console.log('x')