import {Feature} from "../Feature";
import {
    isAssignmentExpression,
    isIdentifier,
    isUpdateExpression,
    isVariableDeclarator,
    literal,
    isFunctionDeclaration,
    getValueInformation,
    isExpressionStatement,
    isBlockStatement,
    isVariableDeclaration,
    isLoop
} from "../Util";
import {Value, unknown} from "../Value";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

const enum RunCount{
    ONE, ZERO_OR_ONE, UNKNOWN
}

interface Var {
    value:Value;
    writesFromFunctionOnly:boolean;
    writesInLoops:Expression[];
}

feature.addPhase().before.onVariableDeclarator((node:AstNode<VariableDeclarator, Var>)=> {
    var expression = node.expression;
    var declaration = node.parent.expression as VariableDeclaration;
    node.scope.save(expression.id, {
        value: unknown,
        writesFromFunctionOnly: true,
        writesInLoops: []
    }, declaration.kind === 'let');
});

function setWriteInfo(modified:Expression, node:AstNode<Expression, Var>) {
    if (modified && isIdentifier(modified)) {
        var variable = node.scope.get(modified);

        if(variable){
            var current = node;
            while (current.parent) {
                current = current.parent;
                if (isFunctionDeclaration(current.expression)) {
                    break;
                }
                if (isLoop(current.expression)) {
                    variable.writesInLoops.push(current.expression);
                }
            }

            if (!node.scope.hasInCurrentFunction(modified)) {
                variable.writesFromFunctionOnly = false;
            }
        }
    }
}

feature.addPhase().before.onUpdateExpression((node:AstNode<UpdateExpression, Var>)=> {
    setWriteInfo(node.expression.argument, node);
});

feature.addPhase().before.onAssignmentExpression((node:AstNode<AssignmentExpression, Var>)=> {
    setWriteInfo(node.expression.left, node);
});

var phase = feature.addPhase();

function handleAssignment(node:AstNode<any, Var>, id:Identifier, operator:string, valueExpression:Expression) {
    var variable = node.scope.get(id);

    if (!variable) {
        return;
    }

    var value = getValueInformation(valueExpression);
    if (value) {
        var newValue:Value;
        if (operator === '=') {
            newValue = value; //can overwrite unknown value
        } else {
            var mapper = new Function('current,value', `return current ${operator} value;`) as (x, y)=>any;
            newValue = variable.value.product(value, mapper);
        }

        var runCunt = getRunCount(node);
        if (runCunt === RunCount.ONE) {
            variable.value = newValue;
        } else if (runCunt === RunCount.ZERO_OR_ONE) {
            variable.value = variable.value.or(newValue);
        } else {
            variable.value = unknown;
        }
    } else {
        variable.value = unknown;
    }
}

phase.after.onAssignmentExpression((node:AstNode<AssignmentExpression, Var>)=> {
    var left = node.expression.left;
    if (isIdentifier(left)) {
        handleAssignment(node, left, node.expression.operator, node.expression.right);
    }
});

phase.before.onUpdateExpression((node:AstNode<UpdateExpression, Var>)=> {
    var arg = node.expression.argument;
    if (isIdentifier(arg)) {
        var resolvedOperator = node.expression.operator[0] + '=';
        handleAssignment(node, arg, resolvedOperator, literal(1));
    }
});

phase.before.onIdentifier((node:AstNode<Identifier,Var>)=> {
    var parentExpression = node.parent.expression;
    var expression = node.expression;
    if (isVariableDeclarator(parentExpression) && parentExpression.id === expression) {
        var init = parentExpression.init || literal(void 0);
        handleAssignment(node, parentExpression.id, '=', init);
        return; //just initializing
    }

    if (!node.scope.hasInCurrentFunction(expression)) {
        return;//another scope
    }

    if (isUpdateExpression(parentExpression)) {
        return;
    }
    if (isAssignmentExpression(parentExpression)) {
        if (parentExpression.left === expression) {
            return; //LHS
        }
    }

    var variable = node.scope.get(expression);

    if (variable) {
        if (variable.writesFromFunctionOnly && !canBeModifiedInLoop(variable, node)) {
            var value = variable.value;
            node.setCalculatedValue(value);
        }
    }
});

function canBeModifiedInLoop(variable:Var, node:AstNode<Expression,any>) {
    var current = node;
    while (current.parent) {
        current = current.parent;
        if (variable.writesInLoops.indexOf(current.expression) !== -1) {
            return true;
        }
    }
    return false;
}

function getRunCount(node:AstNode<Expression,any>):RunCount {
    var current = node;
    var result:RunCount = RunCount.ONE;
    while (current.parent) {
        current = current.parent;
        var expression = current.expression;
        if (isExpressionStatement(expression) || isVariableDeclarator(expression) || isVariableDeclaration(expression)) {
            continue;
        }
        if (isBlockStatement(expression)) {
            continue;
        }
        if (isFunctionDeclaration(expression)) {
            break;
        }

        if (isLoop(expression)) {
            return RunCount.UNKNOWN;
        }

        result = RunCount.ZERO_OR_ONE;
    }
    return result;
}

export = feature;