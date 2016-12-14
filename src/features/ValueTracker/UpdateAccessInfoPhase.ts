import {Feature} from "../../Feature";
import {isIdentifier, isVariableDeclarator, isForInStatement, isForOfStatement, isRealUsage} from "../../Util";
import Variable = require("./Variable");
import AstNode = require("../../AstNode");

export = function (feature:Feature<Variable>) {
    let updateAccessInfoPhase = feature.addPhase();
    updateAccessInfoPhase.before.onUpdateExpression((node:AstNode<UpdateExpression, Variable>) => {
        setAccessInfo(node.expression.argument, node, true);
    });

    updateAccessInfoPhase.before.onAssignmentExpression((node:AstNode<AssignmentExpression, Variable>) => {
        setAccessInfo(node.expression.left, node, true);
    });

    updateAccessInfoPhase.before.onIdentifier((node:AstNode<Identifier, Variable>) => {
        let loopParent = node.parent.expression;
        let left = node.expression;
        if (isVariableDeclarator(loopParent)) {
            loopParent = node.parent.parent.parent.expression;
            left = node.parent.parent.expression;
        }
        if ((isForInStatement(loopParent) || isForOfStatement(loopParent)) && loopParent.left === left) {
            setAccessInfo(node.expression, node, true);
        } else {
            if (isRealUsage(node.expression, node.parent.expression)) {
                setAccessInfo(node.expression, node, false);
            }
        }
    });
};

function setAccessInfo(accessedExpression:Expression, node:AstNode<Expression, Variable>, write:boolean) {
    if (accessedExpression && isIdentifier(accessedExpression)) {
        const variable = node.scope.get(accessedExpression);

        if (variable) {
            if (variable.functionDeclaration && node.scope.inside(variable.functionDeclaration)) {
                return; //recursion
            }
            variable.setAccessInfo(accessedExpression, node, write);
        }
    }
}