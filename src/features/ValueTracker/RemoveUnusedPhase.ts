import {Feature} from "../../Feature";
import {isIdentifier, binaryExpression, literal, isLoop, declaration, expressionStatement} from "../../Util";
import Variable = require("./Variable");
import AstNode = require("../../AstNode");
export = function (feature:Feature<Variable>) {

    const removeUnusedPhase = feature.addPhase();

    removeUnusedPhase.before.onFunctionDeclaration((node:AstNode<FunctionDeclaration, Variable>) => {
        if (canRemove(node, node.expression.id)) {
            node.remove();
        }
    });

    removeUnusedPhase.before.onUpdateExpression((node:AstNode<UpdateExpression, Variable>) => {
        const expression = node.expression.argument;
        if (isIdentifier(expression) && canRemove(node, expression)) {
            node.replaceWith([binaryExpression(node.expression.operator[0], expression, literal(1))]);
        }
    });

    removeUnusedPhase.before.onAssignmentExpression((node:AstNode<AssignmentExpression, Variable>) => {
        const left = node.expression.left;
        if (isIdentifier(left) && canRemove(node, left)) {
            node.replaceWith([node.expression.right]);
        }
    });

    removeUnusedPhase.before.onVariableDeclarator((node:AstNode<VariableDeclarator, Variable>) => {
        if(!canRemove(node,node.expression.id)){
            return;
        }

        const parentExpression = node.parent.expression as VariableDeclaration;
        if (isLoop(node.parent.parent.expression)) { //for(var i in x){}
            return;
        }
        const index = parentExpression.declarations.indexOf(node.expression as VariableDeclarator);
        const before = parentExpression.declarations.slice(0, index);
        const after = parentExpression.declarations.slice(index + 1);

        const result:Expression[] = [];
        if (before.length) {
            result.push(declaration(before, parentExpression.kind));
        }
        if (node.expression.init) {
            result.push(expressionStatement(node.expression.init));
        }
        if (after.length) {
            result.push(declaration(after, parentExpression.kind));
        }

        node.parent.replaceWith(result);
    });

//todo only if no fn references the var
}

function canRemove(node:AstNode<Expression, Variable>, id:Identifier) {
    const variable = node.scope.get(id);
    return variable && variable.isSafe() && !variable.canBeModifiedInLoop(node) && !variable.isUsed(node.expression) && !node.scope.isGlobal(id);
}