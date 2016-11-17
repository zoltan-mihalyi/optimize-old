import {Feature} from "../Feature";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

interface Counter {
    functionDeclaration:FunctionDeclaration;
    usages:number;
}

var feature:Feature<Counter> = new Feature<Counter>();

feature.addPhase().before.onFunctionDeclaration((node:AstNode<FunctionDeclaration,Counter>) => {
    node.scope.save(node.expression.id, {
        functionDeclaration: node.expression,
        usages: 0
    }, false);
});

feature.addPhase().before.onIdentifier((node:AstNode<Identifier,Counter>) => {
    var saved = node.scope.get(node.expression);
    if (saved && !node.scope.inside(saved.functionDeclaration)) {
        saved.usages++;
    }
});

feature.addPhase().before.onFunctionDeclaration((node:AstNode<FunctionDeclaration,Counter>) => {
    var saved = node.scope.get(node.expression.id);
    if (saved.usages === 1) {
        node.remove();
    }
});

export = feature;