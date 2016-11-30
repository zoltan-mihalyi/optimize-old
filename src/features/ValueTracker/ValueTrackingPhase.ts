import {Feature} from "../../Feature";
import {
    isFunctionLike,
    isLoop,
    isIfStatement,
    isBinaryExpressionLike,
    getValueInformation,
    isAssignmentExpression,
    isUpdateExpression,
    isExpressionStatement,
    isIdentifier,
    literal,
    isMemberExpression,
    isVariableDeclarator
} from "../../Util";
import {unknown, KnownValue, Value} from "../../Value";
import AstNode = require("../../AstNode");
import Variable = require("./Variable");
export = function (feature:Feature<Variable>) {

    let valueTrackingPhase = feature.addPhase();

    valueTrackingPhase.after.onVariableDeclarator((node:AstNode<VariableDeclarator, Variable>) => {
        const init = node.expression.init || literal(void 0);
        handleAssignment(node, init, node.expression.id, '=', init);
    });

    valueTrackingPhase.after.onAssignmentExpression((node:AstNode<AssignmentExpression, Variable>) => {
        const left = node.expression.left;
        if (isIdentifier(left)) {
            handleAssignment(node, node.expression, left, node.expression.operator, node.expression.right);
        }
    });

    valueTrackingPhase.after.onUpdateExpression((node:AstNode<UpdateExpression, Variable>) => {
        const arg = node.expression.argument;
        if (isIdentifier(arg)) {
            const resolvedOperator = node.expression.operator[0] + '=';
            handleAssignment(node, node.expression, arg, resolvedOperator, literal(1));
        }
    });

    valueTrackingPhase.after.onIdentifier((node:AstNode<Identifier, Variable>) => {
        const expression = node.expression;
        const parentExpression = node.parent.expression;

        if (!isRealUsage(expression, parentExpression)) {
            return;
        }

        const variable = node.scope.get(expression);
        if (!variable) {
            return;
        }
        variable.merge(getScopes(node));
        const topValue = variable.topValue();
        if (variable.functionDeclaration && node.scope.inside(variable.functionDeclaration)) {
            return; //recursion
        }
        if (isExpressionStatement(parentExpression)) {
            node.parent.remove();
            return;
        }
        variable.markUsed(node);

        if (canSubstitute(node, variable)) {
            node.setCalculatedValue(topValue.value);
        }
    });
}

function canSubstitute(node:AstNode<Identifier, Variable>, variable:Variable):boolean {
    const expression = node.expression;
    const parentExpression = node.parent.expression;
    if (!node.scope.hasInCurrentFunction(expression)) {
        return false;
    }

    if (isUpdateExpression(parentExpression)) {
        return false;
    }

    return variable.isSafe(true) && !variable.canBeModifiedInLoop(node);
}

function isRealUsage(identifier:Identifier, parentExpression:Expression) {
    if (isMemberExpression(parentExpression) && parentExpression.property === identifier) {
        return false; //only property
    }

    if (isVariableDeclarator(parentExpression) && parentExpression.id === identifier) {
        return false; //just initializing
    }

    if (isFunctionLike(parentExpression)) {
        return false; //function declaration
    }

    if (isAssignmentExpression(parentExpression)) {
        if (parentExpression.left === identifier) {
            return false; //LHS
        }
    }
    return true;
}

function handleAssignment(node:AstNode<Expression, Variable>, source:Expression, id:Identifier, operator:string, value:Expression) {
    if (!node.scope.hasInCurrentFunction(id)) {
        return;
    }
    const variable = node.scope.get(id);
    const myScopes = getScopes(node);
    const myTopScope = myScopes[myScopes.length - 1];

    variable.merge(myScopes);

    const topValue = variable.topValue();

    let newValue:Value;

    if (variable.canBeModifiedInLoop(node)) {
        newValue = unknown;
    } else {
        const valueInfo = getValueInformation(value) || unknown;
        if (operator === '=') {
            newValue = valueInfo;
        } else {
            const mapper = new Function('current,value', `return current ${operator} value;`) as (x, y)=>any;
            newValue = topValue.value.product(valueInfo, (left, right) => {
                if (left instanceof KnownValue && right instanceof KnownValue) {
                    return new KnownValue(mapper(left.value, right.value));
                }
                return unknown;
            });
        }
    }

    variable.updateValue(myTopScope, source, newValue, operator === '=');
}


function getScopes(node:AstNode<Expression, Variable>):Expression[] {
    const result:Expression[] = [];
    let current = node;
    while (current.parent) {
        const expression = current.expression;
        if (isFunctionLike(expression) || isLoop(expression) || isIfStatement(expression) || isBinaryExpressionLike(expression)) {
            result.unshift(expression);
        }

        current = current.parent;
    }
    return result;
}
