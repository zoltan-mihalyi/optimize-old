import {Feature, ASTPoint} from "../Feature";
import Scope = require("../Scope");

interface Counter {
    functionDeclaration:FunctionDeclaration;
    usages:number;
}

var feature:Feature<Counter> = new Feature<Counter>();

feature.before.onFunctionDeclaration((fd:ASTPoint<FunctionDeclaration>, scope:Scope<Counter>) => {
    scope.save(fd.expression.id, {
        functionDeclaration: fd.expression,
        usages: 0
    }, false);
});

feature.after.onIdentifier((id:ASTPoint<Identifier>, scope:Scope<Counter>) => {
    var saved = scope.get(id.expression);
    if (saved && !scope.inside(saved.functionDeclaration)) {
        saved.usages++;
    }
});

feature.after.onFunctionDeclaration((fd:ASTPoint<FunctionDeclaration>, scope:Scope<Counter>) => {
    var saved = scope.get(fd.expression.id);
    if (saved.usages === 1) {
        fd.remove();
    }
});

export = feature;