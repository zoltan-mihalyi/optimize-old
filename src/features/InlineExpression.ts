import {Feature} from "../Feature";
import {
    isAssignmentExpression,
    isIdentifier,
    isUpdateExpression,
    isVariableDeclarator,
    literal,
    getValueInformation,
    isExpressionStatement,
    isBlockStatement,
    isVariableDeclaration,
    isLoop,
    isFunctionLike,
    isMemberExpression,
    isProgram,
    identifier
} from "../Util";
import {Value, unknown, KnownValue, ObjectValue, ObjectClass} from "../Value";
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

var declarationPhase = feature.addPhase();
declarationPhase.before.onProgram((node:AstNode<Program, Var>)=> {
    saveApi(node, 'Math', ObjectClass.Object);
    saveApi(node, 'Date', ObjectClass.Function);
    //TODO
});

function saveApi(node:AstNode<any,Var>, name:string, type:ObjectClass) {
    node.scope.save(identifier(name), {
        value: new ObjectValue(type),
        writesFromFunctionOnly: true,
        writesInLoops: []
    }, false);
}

declarationPhase.before.onVariableDeclarator((node:AstNode<VariableDeclarator, Var>)=> {
    var expression = node.expression;
    var declaration = node.parent.expression as VariableDeclaration;
    node.scope.save(expression.id, {
        value: unknown,
        writesFromFunctionOnly: true,
        writesInLoops: []
    }, declaration.kind === 'let');
});

declarationPhase.before.onFunctionDeclaration((node:AstNode<FunctionDeclaration, Var>)=> {
    node.scope.save(node.expression.id, {
        value: new ObjectValue(ObjectClass.Function),
        writesFromFunctionOnly: true,
        writesInLoops: []
    }, false);
});

function setWriteInfo(modified:Expression, node:AstNode<Expression, Var>) {
    if (modified && isIdentifier(modified)) {
        var variable = node.scope.get(modified);

        if (variable) {
            var current = node;
            while (current.parent) {
                current = current.parent;
                if (isFunctionLike(current.expression)) {
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

var substitutionPhase = feature.addPhase();

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
            newValue = variable.value.product(value, (left, right)=> {
                if (left instanceof KnownValue && right instanceof KnownValue) {
                    return new KnownValue(mapper(left.value, right.value));
                }
                return unknown;
            });
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

substitutionPhase.after.onAssignmentExpression((node:AstNode<AssignmentExpression, Var>)=> {
    var left = node.expression.left;
    if (isIdentifier(left)) {
        handleAssignment(node, left, node.expression.operator, node.expression.right);
    }
});

substitutionPhase.before.onUpdateExpression((node:AstNode<UpdateExpression, Var>)=> {
    var arg = node.expression.argument;
    if (isIdentifier(arg)) {
        var resolvedOperator = node.expression.operator[0] + '=';
        handleAssignment(node, arg, resolvedOperator, literal(1));
    }
});

substitutionPhase.before.onIdentifier((node:AstNode<Identifier,Var>)=> {
    var parentExpression = node.parent.expression;
    var expression = node.expression;

    if (isMemberExpression(parentExpression) && parentExpression.property === expression) {
        return; //only property
    }

    if (isVariableDeclarator(parentExpression) && parentExpression.id === expression) {
        var init = parentExpression.init || literal(void 0);
        handleAssignment(node, parentExpression.id, '=', init);
        return; //just initializing
    }

    if (!node.scope.hasInCurrentFunction(expression)) {
        return;//another scope or not defined
    }

    if (isUpdateExpression(parentExpression)) {
        return;
    }
    if (isAssignmentExpression(parentExpression)) {
        if (parentExpression.left === expression) {
            return; //LHS
        }
    }

    if (isExpressionStatement(parentExpression)) {
        node.parent.remove();
    }

    var variable = node.scope.get(expression);

    if (variable.writesFromFunctionOnly && !canBeModifiedInLoop(variable, node)) {
        var value = variable.value;
        node.setCalculatedValue(value);
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
        if (isFunctionLike(expression) || isProgram(expression)) {
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