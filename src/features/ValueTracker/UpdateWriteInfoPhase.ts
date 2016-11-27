import {Feature} from "../../Feature";
import {isIdentifier} from "../../Util";
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
}

function setWriteInfo(modified:Expression, node:AstNode<Expression, Variable>) {
    if (modified && isIdentifier(modified)) {
        const variable = node.scope.get(modified);

        if (variable) {
            variable.setWriteInfo(modified, node);
        }
    }
}