import {Feature} from "../../Feature";
import {
    isIdentifier,
    declaration,
    isVariableDeclaration,
    isReturnStatement,
    block,
    returnStatement,
    isExpressionStatement,
    binaryExpression,
    expressionStatement,
    isVariableDeclarator,
    declarator,
    isCallExpression,
    call,
    isMemberExpression,
    memberExpression,
    isUnaryExpression,
    unaryExpression,
    isAssignmentExpression,
    assignment,
    isIfStatement,
    ifStatement,
    isArrayExpression,
    array,
    isLiteral,
    isBinaryExpressionLike,
    isForStatement,
    forStatement,
    forInStatement,
    isForInStatementLike,
    isForOfStatement,
    isConditionalExpression,
    conditional,
    isLabeledStatement,
    labeled,
    isObjectExpression,
    object,
    isProperty,
    property,
    isThis
} from "../../Util";
import Variable = require("./Variable");
import AstNode = require("../../AstNode");
import Scope = require("../../Scope");
export = function (feature:Feature<Variable>) {
    feature.addPhase().before.onBlockStatementLike((node:AstNode<BlockStatement, Variable>) => {
        const body = node.expression.body;
        for (let i = 0; i < body.length - 1; i++) {
            const expression = body[i];
            const nextExpression = body[i + 1];

            if (isVariableDeclaration(expression)) {
                const lastDeclarator = expression.declarations[expression.declarations.length - 1];
                let identifier = lastDeclarator.id;
                if (node.scope.isGlobal(identifier) || node.scope.get(identifier).getUsages() !== 1) {
                    continue;
                }
                let init = lastDeclarator.init;

                let replacement:Expression = null;
                const context = {
                    name: identifier.name,
                    replaced: false,
                    init: init,
                    scope: node.scope
                };
                try {
                    replacement = substitute(nextExpression, context);
                } catch (e) {
                    if (e.message !== 'NOT_CLEAN') {
                        throw e;
                    }
                }

                if (replacement && context.replaced) {
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

interface Context {
    name:string;
    replaced:boolean;
    init:Expression;
    scope:Scope<any>;
}

const enum Mode{
    LHS, PROPERTY
}

function substitute(expression:Expression, context:Context, mode?:Mode):Expression {
    if (context.replaced) {
        return expression;
    }
    if (isIdentifier(expression)) {
        if (mode === Mode.PROPERTY) {
            throw new Error('NOT_CLEAN');
        }
        if (mode !== Mode.LHS) {
            if (context.name === expression.name) {
                context.replaced = true;
                return context.init;
            }
            if (!context.scope.get(expression)) {
                throw new Error('NOT_CLEAN');
            }
        }
        return expression;
    } else if (isVariableDeclaration(expression)) {
        return declaration(substituteAll(expression.declarations, context), expression.kind)
    } else if (isVariableDeclarator(expression)) {
        return declarator(expression.id.name, expression.init ? substitute(expression.init, context) : null);
    } else if (isBinaryExpressionLike(expression)) {
        return binaryExpression(expression.operator, substitute(expression.left, context), substitute(expression.right, context));
    } else if (isReturnStatement(expression)) {
        return returnStatement(substitute(expression.argument, context));
    } else if (isExpressionStatement(expression)) {
        return expressionStatement(substitute(expression.expression, context));
    } else if (isCallExpression(expression)) {
        return call(substitute(expression.callee, context), substituteAll(expression.arguments, context));
    } else if (isMemberExpression(expression)) {
        return memberExpression(substitute(expression.object, context), substitute(expression.property, context, Mode.PROPERTY) as Identifier, expression.computed);
    } else if (isUnaryExpression(expression)) {
        return unaryExpression(expression.operator, expression.prefix, substitute(expression.argument, context));
    } else if (isAssignmentExpression(expression)) {
        return assignment(substitute(expression.left, context, Mode.LHS), substitute(expression.right, context));
    } else if (isIfStatement(expression)) {
        return ifStatement(substitute(expression.test, context), expression.consequent, expression.alternate);
    } else if (isArrayExpression(expression)) {
        return array(substituteAll(expression.elements, context));
    } else if (isLiteral(expression)) {
        return expression;
    } else if (isForStatement(expression)) {
        return forStatement(substitute(expression.init, context), expression.test, expression.update, expression.body);
    } else if (isForInStatementLike(expression)) {
        return forInStatement(expression.left, substitute(expression.right, context), expression.body, isForOfStatement(expression));
    } else if (isConditionalExpression(expression)) {
        return conditional(substitute(expression.test, context), expression.consequent, expression.alternate);
    } else if (isLabeledStatement(expression)) {
        return labeled(expression.label.name, substitute(expression.body, context));
    } else if (isObjectExpression(expression)) {
        return object(substituteAll(expression.properties, context));
    } else if (isProperty(expression)) {
        return property(expression.key, substitute(expression.value, context));
    } else if (isThis(expression)) {
        return expression;
    } else {
        throw new Error('UNKNOWN');
    }
}

function substituteAll(expressions:Expression[], context:Context) {
    var result = [];
    for (var i = 0; i < expressions.length; i++) {
        result.push(substitute(expressions[i], context));
    }
    return result;
}