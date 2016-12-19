import {Feature} from "../../Feature";
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
} from "../../Util";
import AstNode = require("../../AstNode");
import Variable = require("./Variable");

const USED_IDS_STORE = 'usedIds';

export = function (feature:Feature<Variable>) {
    let findUsedIdentifiersPhase = feature.addPhase();
    findUsedIdentifiersPhase.before.onIdentifier((node:AstNode<Identifier, Variable>) => {
        markUsedId(node, node.expression);
    });
    findUsedIdentifiersPhase.before.onLabeledStatement((node:AstNode<LabeledStatement, Variable>) => {
        markUsedId(node, node.expression.label);
    });

    feature.addPhase().before.onCallExpression((node:AstNode<CallExpression, Variable>) => {
        var callee = node.expression.callee;

        if (isReturnStatement(node.parent.expression) && isIdentifier(callee)) {
            const variable = node.scope.get(callee);
            if (!variable) {
                return;
            }
            const fd = variable.functionDeclaration;
            if (fd && node.scope.isCurrent(fd)) {
                const label = createUnusedName(node, 'x');

                node.parent.replaceWith([ //change params and goto
                    ...swapVars(node, fd.params, node.expression.arguments),
                    continueStatement(label)
                ]);

                const blockNode = findBlock(node, fd);
                const newBody = block([
                    labeled(label,
                        whileStatement(
                            literal(1),
                            block(blockNode.expression.body.concat(returnStatement()))
                        )
                    )
                ]);

                blockNode.replaceWith([newBody]);
            }
        }
    });
};

function findBlock(node:AstNode<Expression, Variable>, fd:FunctionDeclaration):AstNode<BlockStatement, Variable> {
    while (true) {
        const parent = node.parent;
        if (parent.expression === fd) {
            return node as AstNode<BlockStatement, Variable>;
        }
        node = parent;
    }
}

function swapVars(node:AstNode<Expression,any>, vars:Identifier[], newValues:Expression[]):Expression[] {
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

function createUnusedName(node:AstNode<Expression,Variable>, base:string):string {
    let name = base;
    let i = 2;
    while (node.scope.get(identifier(name), USED_IDS_STORE)) {
        name = base + i;
        i++;
    }
    markUsedId(node, identifier(name));
    return name;
}

function markUsedId(node:AstNode<Expression, Variable>, id:Identifier) {
    if (!node.scope.get(id, USED_IDS_STORE)) {
        node.scope.save(id, 1, false, USED_IDS_STORE);
    }
}