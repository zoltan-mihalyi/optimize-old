import {Feature} from "../Feature";
import {isDirective, isBinaryExpressionLike, isClean} from "../Util";
import AstNode = require("../AstNode");

var feature = new Feature();

feature.addPhase().after.onExpressionStatement((node:AstNode<ExpressionStatement, any>) => {
    var statement = node.expression;
    var expression = statement.expression;

    if (isClean(expression) && !isDirective(statement)) {
        node.remove();
    } else if (isBinaryExpressionLike(expression) && isClean(expression.left) && isClean(expression.right)) {
        node.remove();
    }
});

export = feature;