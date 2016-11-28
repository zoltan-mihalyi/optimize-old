import {Feature} from "../../Feature";
import {isIdentifier, isVariableDeclarator, isForInStatement, isForOfStatement} from "../../Util";
import Variable = require("./Variable");
import AstNode = require("../../AstNode");

export = function (feature:Feature<Variable>) {
    let updateWriteInfoPhase = feature.addPhase();
    updateWriteInfoPhase.before.onUpdateExpression((node:AstNode<UpdateExpression, Variable>) => {
        setWriteInfo(node.expression.argument, node);
    });

    updateWriteInfoPhase.before.onAssignmentExpression((node:AstNode<AssignmentExpression, Variable>) => {
        setWriteInfo(node.expression.left, node);
    });

    updateWriteInfoPhase.before.onIdentifier((node:AstNode<Identifier, Variable>) => {
        let loopParent = node.parent.expression;
        let left = node.expression;
        if (isVariableDeclarator(loopParent)) {
            loopParent = node.parent.parent.parent.expression;
            left = node.parent.parent.expression;
        }
        if ((isForInStatement(loopParent) || isForOfStatement(loopParent)) && loopParent.left === left) {
            setWriteInfo(node.expression, node);
        }
    });
}

function setWriteInfo(modified:Expression, node:AstNode<Expression, Variable>) {
    if (modified && isIdentifier(modified)) {
        const variable = node.scope.get(modified);

        if (variable) {
            variable.setWriteInfo(modified, node);
        }
    }
}