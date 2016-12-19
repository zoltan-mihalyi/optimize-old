import {Feature} from "../../Feature";
import {ObjectClass, ObjectValue, KnownValue, unknown} from "../../Value";
import {identifier, isBlockScoped, isFunctionLike, isDeclared} from "../../Util";
import Variable = require("./Variable");
import AstNode = require("../../AstNode");

export = function (feature:Feature<Variable>):void {
    const declarationPhase = feature.addPhase();

    declarationPhase.before.onProgram((node:AstNode<Program, Variable>) => {
        saveApi(node, 'Math', ObjectClass.Object);
        saveApi(node, 'Date', ObjectClass.Function);
        //TODO
    });

    declarationPhase.before.onVariableDeclarator((node:AstNode<VariableDeclarator, Variable>) => {
        if (isDeclared(node)) {
            return;
        }
        const blockScoped = isBlockScoped(node);
        node.scope.save(node.expression.id, new Variable(node, blockScoped, blockScoped ? unknown : new KnownValue(void 0), false), blockScoped);
    });

    declarationPhase.before.onFunctionDeclaration((node:AstNode<FunctionDeclaration, Variable>) => {
        node.scope.save(node.expression.id, new Variable(node, false, new ObjectValue(ObjectClass.Function, {}), true, node.expression), false);
    });

    declarationPhase.before.onBlockStatementLike((node:AstNode<BlockStatement, Variable>) => {
        if (!node.parent) {
            return;
        }
        const parentExpression = node.parent.expression;
        if (isFunctionLike(parentExpression)) {
            for (let i = 0; i < parentExpression.params.length; i++) {
                const param = parentExpression.params[i];
                node.scope.save(param, new Variable(node, false, unknown, true), false);
            }
        }
    });
};

function saveApi(node:AstNode<any,Variable>, name:string, type:ObjectClass) {
    node.scope.save(identifier(name), new Variable(node, false, new ObjectValue(type, {}), false), false);
}