import {Feature} from "../Feature";
import {
    isIdentifier,
    isReturnStatement,
    returnStatement,
    literal,
    whileStatement,
    labeled,
    block,
    continueStatement,
    declarator,
    declaration,
    identifier,
    assignment
} from "../Util";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().before.onFunctionDeclaration((node:AstNode<FunctionDeclaration, FunctionDeclaration>) => {
    node.scope.save(node.expression.id, node.expression, false);
});

feature.addPhase().before.onCallExpression((node:AstNode<CallExpression, FunctionDeclaration>) => {
    var callee = node.expression.callee;

    if (isReturnStatement(node.parent.expression) && isIdentifier(callee)) {
        var fd = node.scope.get(callee);
        if (fd && node.scope.isCurrent(fd)) {

            fd.body.body.push(returnStatement());

            fd.body = block([
                labeled('x',
                    whileStatement(literal(1), fd.body)
                )
            ]);

            node.parent.replaceWith([...swapVars(fd.params, node.expression.arguments), continueStatement('x')]);
        }
    }
});

function swapVars(vars:Identifier[], newValues:Expression[]):Expression[] {
    var result:Expression[] = [];
    if (vars.length) {
        var declarations:VariableDeclarator[] = [];
        for (var i = 0; i < vars.length; i++) {
            var param = vars[i];
            declarations.push(declarator('new_' + param.name, newValues[i]));
        }
        result.push(declaration(declarations));
    }
    for (var i = 0; i < vars.length; i++) {
        var param = vars[i];
        result.push(assignment(param, identifier('new_' + param.name)));
    }
    return result;
}


export = feature;