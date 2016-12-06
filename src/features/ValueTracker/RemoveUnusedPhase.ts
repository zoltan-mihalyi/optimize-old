import {Feature} from "../../Feature";
import {
    isIdentifier,
    binaryExpression,
    literal,
    declaration,
    expressionStatement,
    declarator,
    isLiteral
} from "../../Util";
import Variable = require("./Variable");
import AstNode = require("../../AstNode");
export = function (feature:Feature<Variable>) {

    const removeUnusedPhase = feature.addPhase();

    removeUnusedPhase.before.onFunctionDeclaration((node:AstNode<FunctionDeclaration, Variable>) => {
        if (canRemove(node, node.expression, node.expression.id)) {
            node.remove();
        }
    });

    removeUnusedPhase.before.onUpdateExpression((node:AstNode<UpdateExpression, Variable>) => {
        const expression = node.expression.argument;
        if (isIdentifier(expression) && canRemove(node, node.expression, expression)) {
            node.replaceWith([binaryExpression(node.expression.operator[0], expression, literal(1))]);
        }
    });

    removeUnusedPhase.before.onAssignmentExpression((node:AstNode<AssignmentExpression, Variable>) => {
        const left = node.expression.left;
        if (isIdentifier(left) && canRemove(node, node.expression, left)) {
            node.replaceWith([node.expression.right]);
        }
    });

    removeUnusedPhase.after.onVariableDeclarator((node:AstNode<VariableDeclarator, Variable>) => {
        const id = node.expression.id;
        if (!canRemove(node, node.expression.init, id)) {
            return; //even the initial value needed
        }

        const parentExpression = node.parent.expression as VariableDeclaration;
        const index = parentExpression.declarations.indexOf(node.expression as VariableDeclarator);
        const before = parentExpression.declarations.slice(0, index);
        const after = parentExpression.declarations.slice(index + 1);

        if (!canRemove(node, node.expression, id)) {
            let newInit:Expression = null;
            if (parentExpression.kind === 'const') {
                if (isLiteral(node.expression.init) && node.expression.init.value === 0) {
                    newInit = node.expression.init;
                } else {
                    newInit = literal(0);
                }
            }

            if (node.expression.init === newInit) {
                return; //disables replacing by itself
            }

            before.push(declarator(id.name, newInit));
        }

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
};

function canRemove(node:AstNode<Expression, Variable>, source:Expression, id:Identifier) {
    const variable = node.scope.get(id);
    return variable && variable.isSafe(false) && !variable.canBeModifiedInLoop(node)
        && !variable.isUsed(source) && !node.scope.isGlobal(id);
}