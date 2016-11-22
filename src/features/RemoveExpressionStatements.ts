import {Feature} from "../Feature";
import {isDirective, isBinaryExpressionLike, isClean} from "../Util";
import AstNode = require("../AstNode");

var feature = new Feature();

feature.addPhase().after.onExpressionStatement((a:AstNode<ExpressionStatement, any>) => {
    var statement = a.expression;
    var expression = statement.expression;

    if (isClean(expression) && !isDirective(statement)) {
        a.remove();
    } else if (isBinaryExpressionLike(expression) && isClean(expression.left) && isClean(expression.right)) {
        a.remove();
    }
});

export = feature;