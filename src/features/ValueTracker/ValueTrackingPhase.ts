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
        handleAssignment(node, node.expression.id, '=', node.expression.init || literal(void 0));
    });

    valueTrackingPhase.after.onAssignmentExpression((node:AstNode<AssignmentExpression, Variable>) => {
        const left = node.expression.left;
        if (isIdentifier(left)) {
            handleAssignment(node, left, node.expression.operator, node.expression.right);
        }
    });

    valueTrackingPhase.after.onUpdateExpression((node:AstNode<UpdateExpression, Variable>) => {
        const arg = node.expression.argument;
        if (isIdentifier(arg)) {
            const resolvedOperator = node.expression.operator[0] + '=';
            handleAssignment(node, arg, resolvedOperator, literal(1));
        }
    });

    valueTrackingPhase.after.onIdentifier((node:AstNode<Identifier, Variable>) => {
        const parentExpression = node.parent.expression;
        const expression = node.expression;

        if (isMemberExpression(parentExpression) && parentExpression.property === expression) {
            return; //only property
        }

        if (isVariableDeclarator(parentExpression) && parentExpression.id === expression) {
            return; //just initializing
        }

        if (isFunctionLike(parentExpression)) {
            return; //function declaration
        }

        if (isAssignmentExpression(parentExpression)) {
            if (parentExpression.left === expression) {
                return; //LHS
            }
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

        variable.markUsed();

        if (!node.scope.hasInCurrentFunction(expression)) {
            return;
        }


        if (isUpdateExpression(parentExpression)) {
            return;
        }

        if (isExpressionStatement(parentExpression)) {
            node.parent.remove();
            return;
        }

        if (variable.isSafe() && !variable.canBeModifiedInLoop(node)) {
            node.setCalculatedValue(topValue.value);
        }
    });
}


function handleAssignment(node:AstNode<Expression, Variable>, id:Identifier, operator:string, value:Expression) {
    if (!node.scope.hasInCurrentFunction(id)) {
        return;
    }
    const variable = node.scope.get(id);
    const myScopes = getScopes(node);
    const myTopScope = myScopes[myScopes.length - 1];

    variable.merge(myScopes);

    const topValue = variable.topValue();

    const valueInfo = getValueInformation(value) || unknown;
    let newValue:Value;

    if (variable.canBeModifiedInLoop(node)) {
        newValue = unknown;
    } else {
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

    variable.updateValue(myTopScope, node.expression, newValue);
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
