import {Feature} from "../../Feature";
import {ObjectClass, ObjectValue, KnownValue} from "../../Value";
import {identifier} from "../../Util";
import Variable = require("./Variable");
import AstNode = require("../../AstNode");

export = function (feature:Feature<Variable>):void {
    const declarationPhase = feature.addPhase();

    declarationPhase.before.onProgram((node:AstNode<Program, Variable>) => {
        saveApi(node, 'Math', ObjectClass.Object);
        saveApi(node, 'Date', ObjectClass.Function);
        //TODO
    });

    declarationPhase.before.onVariableDeclarator((node:AstNode<VariableDeclarator, Variable>) => { //todo let works differently
        let letExpression = (node.parent.expression as VariableDeclaration).kind === 'let';
        node.scope.save(node.expression.id, new Variable(node, letExpression, new KnownValue(void 0)), letExpression);
    });

    declarationPhase.before.onFunctionDeclaration((node:AstNode<FunctionDeclaration, Variable>) => {
        node.scope.save(node.expression.id, new Variable(node, false, new ObjectValue(ObjectClass.Function), node.expression), false);
    });
}

function saveApi(node:AstNode<any,Variable>, name:string, type:ObjectClass) {
    node.scope.save(identifier(name), new Variable(node, false, new ObjectValue(type)), false);
}