function unused() {
}

function used() {
}

used();

usedBeforeDeclaration();

function usedBeforeDeclaration(){
}

function recursive() {
    recursive();
}

(function immediatelyInvoked() {
})();

function usedOnlyAsPropertyGlobal(){}
window.usedOnlyAsPropertyGlobal();

(function(){
    function fn(){}

    window.fn();
})();