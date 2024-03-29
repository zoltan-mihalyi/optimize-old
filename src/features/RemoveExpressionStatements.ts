import {Feature} from "../Feature";
import {isDirective, isBinaryExpressionLike} from "../util/TypeCheckers";
import {isClean} from "../util/Others";
import AstNode = require("../AstNode");

const feature = new Feature();

feature.addPhase().after.onExpressionStatement((node:AstNode<ExpressionStatement, any>) => {
    const statement = node.expression;
    const expression = statement.expression;

    if (isClean(expression) && !isDirective(statement)) {
        node.remove();
    } else if (isBinaryExpressionLike(expression) && isClean(expression.left) && isClean(expression.right)) {
        node.remove();
    }
});

export = feature;