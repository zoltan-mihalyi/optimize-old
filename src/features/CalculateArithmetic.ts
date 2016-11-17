import {Feature} from "../Feature";
import {isLiteral, literal} from "../Util";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onBinaryExpression((node:AstNode<BinaryExpression, any>)=> {
    var expression = node.expression;
    var right = expression.right;
    var left = expression.left;
    if (isLiteral(left) && isLiteral(right)) {
        var value = (new Function('left,right', `return left${expression.operator}right;`))(left.value, right.value);
        node.replaceWith([literal(value)])
    }
});

export = feature;