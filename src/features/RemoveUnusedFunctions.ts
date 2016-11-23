import {Feature} from "../Feature";
import {isRealIdentifier, isVariableDeclarator, isClean, declaration, expressionStatement} from "../Util";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

interface Counter {
    functionDeclaration?:FunctionDeclaration;
    init?:Expression;
    usages:number;
}

var feature:Feature<Counter> = new Feature<Counter>();

var declarationPhase = feature.addPhase();
declarationPhase.before.onVariableDeclarator((node:AstNode<VariableDeclarator, Counter>) => {
    var expression = node.expression;
    var declaration = node.parent.expression as VariableDeclaration;
    node.scope.save(expression.id, {
        usages: 0,
        init: expression.init
    }, declaration.kind === 'let');
});

declarationPhase.before.onFunctionDeclaration((node:AstNode<FunctionDeclaration,Counter>) => {
    node.scope.save(node.expression.id, {
        functionDeclaration: node.expression,
        usages: 0
    }, false);
});

feature.addPhase().before.onIdentifier((node:AstNode<Identifier,Counter>) => {
    var saved = node.scope.get(node.expression);
    if (!saved) {
        return;
    }

    if (!isRealIdentifier(node.expression, node.parent.expression)) {
        return;
    }

    if (saved.functionDeclaration && node.scope.inside(saved.functionDeclaration)) {
        return;
    }
    saved.usages++;
});

function removeIfUnused(node:AstNode<FunctionDeclaration|VariableDeclarator, Counter>) {
    var saved = node.scope.get(node.expression.id);
    if (saved.usages === 1) {

        if (node.scope.isGlobal(node.expression.id)) {
            return;
        }

        if (saved.init) {
            if (!isClean(saved.init)) {
                var parentExpression = node.parent.expression as VariableDeclaration;
                var index = parentExpression.declarations.indexOf(node.expression as VariableDeclarator);
                var before = parentExpression.declarations.slice(0, index);
                var after = parentExpression.declarations.slice(index + 1);

                var result:Expression[] = [];
                if (before.length) {
                    result.push(declaration(before, parentExpression.kind));
                }
                result.push(expressionStatement(saved.init));
                if (after.length) {
                    result.push(declaration(after, parentExpression.kind));
                }

                node.parent.replaceWith(result);
                return;
            }
        }

        if (isVariableDeclarator(node.expression) && (node.parent.expression as VariableDeclaration).declarations.length === 1) {
            node.parent.remove();
        } else {
            node.remove();
        }
    }
}

var removePhase = feature.addPhase();
removePhase.before.onFunctionDeclaration(removeIfUnused);
removePhase.before.onVariableDeclarator(removeIfUnused);

export = feature;