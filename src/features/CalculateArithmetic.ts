import {Feature} from "../Feature";
import {isLiteral, literalLike} from "../Util";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onBinaryExpressionLike((node:AstNode<BinaryExpression, any>)=> {
    var expression = node.expression;
    var right = expression.right;
    var left = expression.left;
    if (isLiteral(left) && isLiteral(right)) {
        var value = (new Function('left,right', `return left${expression.operator}right;`))(left.value, right.value);
        node.replaceWith([literalLike(value)])
    }
});

feature.addPhase().after.onUnaryExpression((node:AstNode<UnaryExpression, any>)=> {
    var expression = node.expression;
    var argument = expression.argument;
    if (isLiteral(argument)) {
        var value = (new Function('arg', `return ${expression.operator} arg;`))(argument.value); //todo postfix operators?
        if (value === void 0 && expression.operator === 'void' && argument.value === 0) {
            return; //already void 0
        }
        node.replaceWith([literalLike(value)])
    }
});

export = feature;