import {Feature} from "../../Feature";
import {
    isFunctionLike,
    isLoop,
    isIfStatement,
    isBinaryExpressionLike,
    isUpdateExpression,
    isExpressionStatement,
    isIdentifier,
    literal,
    isDeclared,
    isTryStatement,
    isMemberExpression,
    isStaticMemberExpression,
    safeValue,
    isRealUsage,
    getPropertyValue,
    isCase,
    isLHS,
    isBlockStatement
} from "../../Util";
import {unknown, KnownValue, Value, ObjectValue, IterableValue, UnknownValue} from "../../Value";
import AstNode = require("../../AstNode");
import Variable = require("./Variable");
export = function (feature:Feature<Variable>) {

    let valueTrackingPhase = feature.addPhase();

    valueTrackingPhase.after.onVariableDeclarator((node:AstNode<VariableDeclarator, Variable>) => {
        let id = node.expression.id;
        if (!node.expression.init) {
            if (node.scope.isGlobal(id)) {
                return;
            }
            if (isDeclared(node) && node.scope.get(id).isInitialized()) {
                return;
            }
        }
        const init = node.expression.init || literal(void 0);
        handleAssignment(node, init, id, '=', safeValue(init));
    });

    valueTrackingPhase.after.onAssignmentExpression((node:AstNode<AssignmentExpression, Variable>) => {
        const left = node.expression.left;
        handleAssignment(node, node.expression, left, node.expression.operator, safeValue(node.expression.right));
    });

    valueTrackingPhase.after.onUpdateExpression((node:AstNode<UpdateExpression, Variable>) => {
        const resolvedOperator = node.expression.operator[0] + '=';
        handleAssignment(node, node.expression, node.expression.argument, resolvedOperator, new KnownValue(1));
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
        const myScopes = getScopes(node);
        variable.merge(myScopes);
        const topValue = variable.topValue();

        if (isExpressionStatement(parentExpression)) {
            node.parent.remove();
            return;
        }
        variable.markUsed();

        if (canSubstitute(node, variable)) {
            node.setCalculatedValue(topValue.value);
        }

        const objResolved = topValue.value.map(val => {
            if (val instanceof ObjectValue) {
                if (isMemberExpression(parentExpression)) {
                    const propertyValue = getPropertyValue(parentExpression);

                    if (isLHS(parentExpression, node.parent.parent.expression)) {
                        return val;
                    }

                    let allClean = true;
                    if (propertyValue instanceof IterableValue) {
                        propertyValue.each(prop => {
                            if (prop instanceof KnownValue) {
                                if (!val.isPropertyClean(prop.value)) {
                                    allClean = false;
                                }
                            } else {
                                allClean = false;
                            }
                        });
                    } else {
                        allClean = false;
                    }

                    if (allClean) {
                        return val;
                    }
                }
                return val.noKnownProperties();
            }
            return val;
        });

        variable.updateValue(myScopes[myScopes.length - 1], expression, objResolved, true, true);
    });
};

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

function handleAssignment(node:AstNode<Expression, Variable>, source:Expression, expression:Expression, operator:string, rightValues:Value) {
    let id:Identifier;
    let propertyValues:Value;
    if (isIdentifier(expression)) {
        id = expression;
    } else if (isMemberExpression(expression)) {
        const object = expression.object;
        propertyValues = isStaticMemberExpression(expression) ? new KnownValue(expression.property.name) : safeValue(expression.property); //todo dup
        if (isIdentifier(object)) {
            id = object;
        } else {
            return;
        }
    }

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
        if (operator === '=') {
            if (propertyValues) {
                newValue = topValue.value.product(propertyValues, (left, prop) => {
                    if (!(left instanceof ObjectValue)) {
                        return left;
                    }

                    if (prop instanceof KnownValue) { //todo dup
                        if (rightValues instanceof UnknownValue) {
                            return left.set(prop.value, rightValues);
                        }
                        return rightValues.map(rval => left.set(prop.value, rval));
                    }
                    return left.noKnownProperties();
                });
            } else {
                newValue = rightValues;
            }
        } else {
            const mapper = new Function('current,value', `return current ${operator} value;`) as (x, y) => any;
            newValue = topValue.value.product(rightValues, (left, right) => {
                if (!(right instanceof KnownValue)) {
                    return unknown;
                }

                if (propertyValues) {
                    if (!(left instanceof ObjectValue)) {
                        return left;
                    }
                    return propertyValues.map(prop => {
                        if (prop instanceof KnownValue) {
                            const leftResolved = left.resolve(prop.value);
                            if (leftResolved instanceof KnownValue) {
                                return left.set(prop.value, new KnownValue(mapper(leftResolved.value, right.value)));
                            } else {
                                return left.set(prop.value, unknown);
                            }
                        }
                        return unknown;
                    });
                } else {
                    if (left instanceof KnownValue) {
                        return new KnownValue(mapper(left.value, right.value));
                    }
                    return unknown;
                }
            });
        }
    }

    newValue = newValue.map(val => { //todo duplicate?
        if (val instanceof ObjectValue && !variable.isSafe(false)) {
            return val.noKnownProperties();
        }
        return val;
    });

    variable.updateValue(myTopScope, source, newValue, operator === '=');
}


function getScopes(node:AstNode<Expression, Variable>):Expression[] {
    const result:Expression[] = [];
    let current = node;
    while (current.parent) {
        const expression = current.parent.expression;
        if (isBlockStatement(current.expression) || isFunctionLike(expression) || isLoop(expression)
            || (isIfStatement(expression) && expression.test !== current.expression)
            || isBinaryExpressionLike(expression) || isTryStatement(expression) || isCase(expression)) {
            result.unshift(current.expression);
        }

        current = current.parent;
    }
    result.unshift(current.expression);
    return result;
}
