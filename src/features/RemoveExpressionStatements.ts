import {Feature} from "../Feature";
import {isDirective, isLiteral, isBinaryExpressionLike, isIdentifier} from "../Util";
import AstNode = require("../AstNode");

var feature = new Feature();

feature.addPhase().after.onExpressionStatement((a:AstNode<ExpressionStatement, any>) => {
    var statement = a.expression;
    var expression = statement.expression;

    if (isLiteral(expression) && !isDirective(statement) || isIdentifier(expression)) {
        a.remove();
    } else if (isBinaryExpressionLike(expression) && isLiteral(expression.left) && isLiteral(expression.right)) {
        a.remove();
    }
});

export = feature;