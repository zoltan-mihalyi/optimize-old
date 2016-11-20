import {Feature} from "../Feature";
import {getValueInformation} from "../Util";
import {KnownValue} from "../Value";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onLogicalExpression((node:AstNode<LogicalExpression, any>)=> {
    var expression = node.expression;
    var leftValue = getValueInformation(expression.left);
    var rightValue = getValueInformation(expression.right);

    if (leftValue && !rightValue) {
        var leftAsBoolean = leftValue.map(x=>!!x);
        if (leftAsBoolean instanceof KnownValue) {
            var useLeft = leftAsBoolean.value;
            if (expression.operator === '&&') {
                useLeft = !useLeft;
            }
            node.replaceWith([useLeft ? expression.left : expression.right])
        }
    }
});

export = feature;