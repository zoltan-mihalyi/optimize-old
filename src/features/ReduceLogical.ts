import {Feature} from "../Feature";
import {isLiteralLike, getLiteralLikeValue} from "../Util";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onLogicalExpression((node:AstNode<LogicalExpression, any>)=> {
    var expression = node.expression;
    var left = expression.left;
    if (isLiteralLike(left) && !isLiteralLike(expression.right)) {
        var useLeft = getLiteralLikeValue(left);
        if (expression.operator === '&&') {
            useLeft = !useLeft;
        }
        node.replaceWith([useLeft ? left : expression.right])
    }
});

export = feature;