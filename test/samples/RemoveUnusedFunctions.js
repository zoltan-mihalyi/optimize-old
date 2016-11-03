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