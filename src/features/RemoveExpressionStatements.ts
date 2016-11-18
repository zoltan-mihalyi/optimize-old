import {Feature} from "../Feature";
import {isDirective, isBinaryExpressionLike, isIdentifier, isLiteralLike} from "../Util";
import AstNode = require("../AstNode");

var feature = new Feature();

feature.addPhase().after.onExpressionStatement((a:AstNode<ExpressionStatement, any>) => {
    var statement = a.expression;
    var expression = statement.expression;

    if (isLiteralLike(expression) && !isDirective(statement) || isIdentifier(expression)) {
        a.remove();
    } else if (isBinaryExpressionLike(expression) && isLiteralLike(expression.left) && isLiteralLike(expression.right)) {
        a.remove();
    }
});

export = feature;