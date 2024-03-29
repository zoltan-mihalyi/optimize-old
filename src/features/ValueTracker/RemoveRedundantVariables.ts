import {Feature} from "../../Feature";
import {
    isIdentifier,
    isVariableDeclaration,
    isReturnStatement,
    isExpressionStatement,
    isVariableDeclarator,
    isCallExpression,
    isMemberExpression,
    isUnaryExpression,
    isAssignmentExpression,
    isIfStatement,
    isArrayExpression,
    isLiteral,
    isBinaryExpressionLike,
    isForStatement,
    isForInStatementLike,
    isForOfStatement,
    isConditionalExpression,
    isLabeledStatement,
    isObjectExpression,
    isProperty,
    isThis,
    isFunctionLike,
    isTryStatement,
    isBlockStatement,
    isWhileStatement,
    isDoWhileStatement,
    isUpdateExpression,
    isNewExpression,
    isThrow,
    isSwitch,
    isLogicalExpression
} from "../../util/TypeCheckers";
import {
    declaration,
    block,
    declarator,
    binaryExpression,
    returnStatement,
    expressionStatement,
    call,
    callNew,
    memberExpression,
    unaryExpression,
    assignment,
    ifStatement,
    array,
    forStatement,
    forInStatement,
    conditional,
    labeled,
    object,
    property,
    update,
    throwStatement,
    switchStatement
} from "../../util/Builders";
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
                    dirty: false,
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
    dirty:boolean;
    init:Expression;
    scope:Scope<any>;
}

const enum Mode{
    LHS, PROPERTY
}

function substitute(expression:Expression, context:Context, mode?:Mode):Expression {
    if (!expression) {
        return expression;
    }
    if (context.replaced) {
        return expression;
    }
    if (context.dirty) {
        throw new Error('NOT_CLEAN');
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
        if (isLogicalExpression(expression)) {
            return binaryExpression(expression.operator, substitute(expression.left, context), expression.right);
        }
        return binaryExpression(expression.operator, substitute(expression.left, context), substitute(expression.right, context));
    } else if (isReturnStatement(expression)) {
        return returnStatement(substitute(expression.argument, context));
    } else if (isExpressionStatement(expression)) {
        return expressionStatement(substitute(expression.expression, context));
    } else if (isCallExpression(expression)) {
        return call(substitute(expression.callee, context), substituteAll(expression.arguments, context));
    } else if (isNewExpression(expression)) {
        return callNew(substitute(expression.callee, context), substituteAll(expression.arguments, context));
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
    } else if (isWhileStatement(expression)) {
        return expression;
    } else if (isDoWhileStatement(expression)) {
        return expression;
    } else if (isConditionalExpression(expression)) {
        return conditional(substitute(expression.test, context), expression.consequent, expression.alternate);
    } else if (isLabeledStatement(expression)) {
        return labeled(expression.label.name, substitute(expression.body, context));
    } else if (isObjectExpression(expression)) {
        return object(substituteAll(expression.properties, context));
    } else if (isProperty(expression)) {
        return property(expression.key, substitute(expression.value, context), expression.method, expression.kind, expression.shorthand, expression.computed);
    } else if (isThis(expression)) {
        return expression;
    } else if (isFunctionLike(expression)) {
        return expression;
    } else if (isTryStatement(expression)) {
        return expression;
    } else if (isBlockStatement(expression)) {
        return block(substituteAll(expression.body, context));
    } else if (isUpdateExpression(expression)) {
        return update(substitute(expression.argument, context), expression.operator, expression.prefix);
    } else if (isThrow(expression)) {
        return throwStatement(substitute(expression.argument, context));
    } else if (isSwitch(expression)) {
        return switchStatement(substitute(expression.discriminant, context), expression.cases);
    } else {
        throw new Error('UNKNOWN: ' + expression.type);
    }
}

function substituteAll(expressions:Expression[], context:Context) {
    const result = [];
    for (let i = 0; i < expressions.length; i++) {
        result.push(substitute(expressions[i], context));
    }
    return result;
}