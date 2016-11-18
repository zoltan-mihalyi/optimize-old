import {Feature} from "../Feature";
import {
    isLiteral,
    isAssignmentExpression,
    isIdentifier,
    literalLike,
    isUpdateExpression,
    isVariableDeclarator,
    isExpressionStatement,
    literal
} from "../Util";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

interface Var {
    value:any;
    hasValue:boolean;
    writesFromFunctionOnly:boolean;
}

feature.addPhase().before.onVariableDeclarator((node:AstNode<VariableDeclarator, Var>)=> {
    var expression = node.expression;
    var declaration = node.parent.expression as VariableDeclaration;
    node.scope.save(expression.id, {
        value: null,
        hasValue: false,
        writesFromFunctionOnly: true
    }, declaration.kind === 'let');
});

feature.addPhase().before.onExpressionStatement((node:AstNode<ExpressionStatement, Var>)=> {
    var expression = node.expression.expression;
    var modified = getModifiedExpression(expression);
    if (modified && isIdentifier(modified)) {
        var variable = node.scope.get(modified);
        if (variable && !node.scope.hasInCurrentFunction(modified)) {
            variable.writesFromFunctionOnly = false;
        }
    }
});

var phase = feature.addPhase();

function handleAssignment(node:AstNode<any, Var>, id:Identifier, operator:string, initial:Expression) {
    var variable = node.scope.get(id);

    if (variable) {
        var runsAlways = (isExpressionStatement(node.parent.expression) || isVariableDeclarator(node.parent.expression));
        if (runsAlways && isLiteral(initial) && node.scope.hasInCurrentBlock(id)) {
            var assigner = new Function('variable,newValue', `variable.value${operator}newValue`);
            assigner(variable, initial.value);
            variable.hasValue = true;
        } else {
            variable.hasValue = false;
        }
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
        handleAssignment(node, parentExpression.id, '=', parentExpression.init);
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

    var value = node.scope.get(expression);

    if (value && value.writesFromFunctionOnly && value.hasValue) {
        node.replaceWith([literalLike(value.value)]);
    }
});

function getModifiedExpression(e:Expression):Expression {
    if (isAssignmentExpression(e)) {
        return e.left;
    } else if (isUpdateExpression(e)) {
        return e.argument;
    }
}

export = feature;