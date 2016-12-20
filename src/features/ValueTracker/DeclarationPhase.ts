import {Feature} from "../../Feature";
import {ObjectType, ObjectValue, KnownValue, unknown} from "../../Value";
import {identifier, isBlockScoped, isFunctionLike, isDeclared} from "../../Util";
import {FunctionObjectClass, ObjectClass, ObjectObjectClass} from "../../ObjectClasses";
import Variable = require("./Variable");
import AstNode = require("../../AstNode");

export = function (feature:Feature<Variable>):void {
    const declarationPhase = feature.addPhase();

    declarationPhase.before.onProgram((node:AstNode<Program, Variable>) => {
        saveApi(node, 'Math', ObjectType.Object, new ObjectObjectClass());
        saveApi(node, 'Date', ObjectType.Function, new FunctionObjectClass());
        //TODO
    });

    declarationPhase.before.onVariableDeclarator((node:AstNode<VariableDeclarator, Variable>) => {
        if (isDeclared(node)) {
            return;
        }
        const blockScoped = isBlockScoped(node);
        const value = (blockScoped || node.scope.isGlobal()) ? unknown : new KnownValue(void 0);
        node.scope.save(node.expression.id, new Variable(node, blockScoped, value, false), blockScoped);
    });

    declarationPhase.before.onFunctionDeclaration((node:AstNode<FunctionDeclaration, Variable>) => {
        const objectValue = new ObjectValue(ObjectType.Function, new FunctionObjectClass(), {});
        const variable = new Variable(node, false, objectValue, true, node.expression);
        node.scope.save(node.expression.id, variable, false);
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

function saveApi(node:AstNode<any,Variable>, name:string, type:ObjectType, objectClass:ObjectClass) {
    node.scope.save(identifier(name), new Variable(node, false, new ObjectValue(type, objectClass, {}), false), false);
}