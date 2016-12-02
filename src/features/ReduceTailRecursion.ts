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
import AstNode = require("../AstNode");

var feature:Feature<FunctionDeclaration|1> = new Feature<any>();

let findUsedIdentifiersPhase = feature.addPhase();
findUsedIdentifiersPhase.before.onIdentifier((node:AstNode<Identifier, FunctionDeclaration|1>) => {
    markUsedId(node, node.expression);
});
findUsedIdentifiersPhase.before.onLabeledStatement((node:AstNode<LabeledStatement, FunctionDeclaration|1>) => {
    markUsedId(node, node.expression.label);
});

feature.addPhase().before.onFunctionDeclaration((node:AstNode<FunctionDeclaration, FunctionDeclaration|1>) => {
    node.scope.save(node.expression.id, node.expression, false);
});

feature.addPhase().before.onCallExpression((node:AstNode<CallExpression, FunctionDeclaration|1>) => {
    var callee = node.expression.callee;

    if (isReturnStatement(node.parent.expression) && isIdentifier(callee)) {
        let fd = node.scope.get(callee);
        if (typeof fd !== 'number' && fd && node.scope.isCurrent(fd)) {
            fd.body.body.push(returnStatement());

            let label = createUnusedName(node, 'x');
            fd.body = block([
                labeled(label,
                    whileStatement(literal(1), fd.body)
                )
            ]);

            node.parent.replaceWith([...swapVars(node, fd.params, node.expression.arguments), continueStatement(label)]);
        }
    }
});

function swapVars(node:AstNode<any,any>, vars:Identifier[], newValues:Expression[]):Expression[] {
    var result:Expression[] = [];
    if (vars.length) {
        let declarations:VariableDeclarator[] = [];
        result.push(declaration(declarations));
        for (let i = 0; i < vars.length; i++) {
            const param = vars[i];
            let newName = createUnusedName(node, 'new_' + param.name);
            declarations.push(declarator(newName, newValues[i]));
            result.push(assignment(param, identifier(newName)));
        }
    }
    return result;
}

function createUnusedName(node:AstNode<any,any>, base:string):string {
    let name = base;
    let i = 2;
    while (node.scope.get(identifier(name))) {
        name = base + i;
        i++;
    }
    markUsedId(node, identifier(name));
    return name;
}

function markUsedId(node:AstNode<any, FunctionDeclaration|any>, id:Identifier) {
    if (!node.scope.get(id)) {
        node.scope.save(id, 1, false);
    }
}

export = feature;