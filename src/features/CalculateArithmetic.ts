import {Feature} from "../Feature";
import {isLiteral, literalLike, isLiteralLike, getLiteralLikeValue} from "../Util";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onBinaryExpressionLike((node:AstNode<BinaryExpression, any>)=> {
    var expression = node.expression;
    var right = expression.right;
    var left = expression.left;
    if (isLiteralLike(left) && isLiteralLike(right)) {
        var evaluator = new Function('left,right', `return left${expression.operator}right;`);
        var value = evaluator(getLiteralLikeValue(left), getLiteralLikeValue(right));
        node.replaceWith([literalLike(value)])
    }
});

feature.addPhase().after.onUnaryExpression((node:AstNode<UnaryExpression, any>)=> {
    var expression = node.expression;
    var argument = expression.argument;
    if (isLiteralLike(argument)) {
        var value = (new Function('arg', `return ${expression.operator} arg;`))(getLiteralLikeValue(argument)); //todo postfix operators?
        if (value === void 0 && expression.operator === 'void' && isLiteral(argument) && argument.value === 0) {
            return; //already void 0
        }
        node.replaceWith([literalLike(value)])
    }
});

export = feature;