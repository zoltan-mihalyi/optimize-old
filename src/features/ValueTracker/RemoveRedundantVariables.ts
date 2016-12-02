import {Feature} from "../../Feature";
import {
    isIdentifier,
    declaration,
    expressionStatement,
    declarator,
    isVariableDeclaration,
    isReturnStatement,
    block,
    returnStatement,
    isCallExpression,
    call,
    isExpressionStatement
} from "../../Util";
import Variable = require("./Variable");
import AstNode = require("../../AstNode");
export = function (feature:Feature<Variable>) {
    feature.addPhase().before.onBlockStatementLike((node:AstNode<BlockStatement, Variable>) => {
        const body = node.expression.body;
        for (let i = 0; i < body.length - 1; i++) {
            const expression = body[i];
            let nextExpression = body[i + 1];
            if (isExpressionStatement(nextExpression)) {
                nextExpression = nextExpression.expression;
            }

            if (isVariableDeclaration(expression)) {
                const lastDeclarator = expression.declarations[expression.declarations.length - 1];
                let identifier = lastDeclarator.id;
                if (node.scope.isGlobal(identifier) || node.scope.get(identifier).getUsages() !== 1) {
                    continue;
                }
                let init = lastDeclarator.init;

                let replacement:Expression = null;
                if (isReturnStatement(nextExpression) && isGivenIdentifier(nextExpression.argument, identifier)) {
                    replacement = returnStatement(init);
                } else if (isVariableDeclaration(nextExpression)) {
                    let firstDeclaration = nextExpression.declarations[0];
                    if (isGivenIdentifier(firstDeclaration.init, identifier)) {
                        replacement = declaration([
                            declarator(firstDeclaration.id.name, init),
                            ...nextExpression.declarations.slice(1)
                        ], nextExpression.kind);
                    }
                } else if (isCallExpression(nextExpression) && isIdentifier(nextExpression.callee) && node.scope.get(nextExpression.callee)) {
                    let firstArgument = nextExpression.arguments[0];
                    if (isGivenIdentifier(firstArgument, identifier)) {
                        replacement = expressionStatement(call(nextExpression.callee, [
                            init,
                            ...nextExpression.arguments.slice(1)
                        ]));
                    }
                }

                if (replacement) {
                    let before = body.slice(0, i);
                    if (expression.declarations.length > 1) {
                        before.push(declaration(expression.declarations.slice(0, expression.declarations.length - 1), expression.kind));
                    }
                    let after = body.slice(i + 2);
                    node.replaceWith([block([...before, replacement, ...after])]);
                    return;
                }
            }
        }
    });
};

function isGivenIdentifier(expression:Expression, identifier:Identifier):boolean {
    return expression && isIdentifier(expression) && expression.name === identifier.name;
}