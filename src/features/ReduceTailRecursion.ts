import {Feature, ASTPoint} from "../Feature";
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

var feature: Feature<any> = new Feature<any>();

feature.addPhase().before.onFunctionDeclaration((fd: ASTPoint<FunctionDeclaration>, scope: Scope<FunctionDeclaration>) => {
    scope.save(fd.expression.id, fd.expression, false);
});

feature.addPhase().before.onCallExpression((call: ASTPoint<CallExpression>, scope: Scope<FunctionDeclaration>) => {
    var callee = call.expression.callee;

    if (isReturnStatement(call.parent.expression) && isIdentifier(callee)) {
        var fd = scope.get(callee);
        if (fd && scope.isCurrent(fd)) {

            fd.body.body.push(returnStatement());

            fd.body = block([
                labeled('x',
                    whileStatement(literal(1), fd.body)
                )
            ]);


            call.parent.replaceWith([...swapVars(fd.params, call.expression.arguments), continueStatement('x')]);
        }
    }
});

function swapVars(vars: Identifier[], newValues: Expression[]): Expression[] {
    var result: Expression[] = [];
    if (vars.length) {
        var declarations: VariableDeclarator[] = [];
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