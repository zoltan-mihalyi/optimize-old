import {Feature} from "../Feature";
import {getValueInformation} from "../Util";
import {KnownValue} from "../Value";
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onLogicalExpression((node:AstNode<LogicalExpression, any>)=> {
    var expression = node.expression;
    var leftValue = getValueInformation(expression.left);

    if (leftValue) {
        var leftAsBoolean = leftValue.map(value=> {
            if (value instanceof KnownValue) {
                return new KnownValue(!!value.value);
            } else {
                return new KnownValue(true);
            }
        });
        if (leftAsBoolean instanceof KnownValue) {
            var useLeft = leftAsBoolean.value;
            if (expression.operator === '&&') {
                useLeft = !useLeft;
            }
            node.replaceWith([useLeft ? expression.left : expression.right]);
        }
    }
});

export = feature;