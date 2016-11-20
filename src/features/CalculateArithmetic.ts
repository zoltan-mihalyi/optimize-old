import {Feature} from "../Feature";
import {getValueInformation} from "../Util";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onBinaryExpressionLike((node:AstNode<BinaryExpression, any>)=> {
    var expression = node.expression;
    var rightValue = getValueInformation(expression.right);
    var leftValue = getValueInformation(expression.left);
    if (leftValue && rightValue) {
        var evaluator = new Function('left,right', `return left ${expression.operator} right;`) as (x, y)=>any;
        node.setCalculatedValue(leftValue.product(rightValue, evaluator));
    }
});

feature.addPhase().after.onUnaryExpression((node:AstNode<UnaryExpression, any>)=> {
    var expression = node.expression;
    var argument = expression.argument;
    var valueInformation = getValueInformation(argument);
    if (valueInformation) {
        var mapper = new Function('arg', `return ${expression.operator} arg;`) as (x)=>any;
        node.setCalculatedValue(valueInformation.map(mapper));
    }
});

export = feature;