import {Feature, ASTPoint} from "../Feature";
import {isDirective, isLiteral, isBinaryExpression, isIdentifier} from "../Util";

var feature = new Feature();

feature.after.onExpressionStatement((a:ASTPoint<ExpressionStatement>) => {
    var statement = a.expression;
    var expression = statement.expression;

    if (isLiteral(expression) && !isDirective(statement) || isIdentifier(expression)) {
        a.remove();
    } else if (isBinaryExpression(expression) && isLiteral(expression.left) && isLiteral(expression.right)) {
        a.remove();
    }
});

export = feature;