import {Feature} from "../Feature";
import {getValueInformation} from "../Util";
import {KnownValue, unknown, ObjectValue, ObjectClass, ComparisonResult} from "../Value";
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onBinaryExpressionLike((node:AstNode<BinaryExpression, any>) => {
    var expression = node.expression;
    var rightValue = getValueInformation(expression.right);
    var leftValue = getValueInformation(expression.left);
    if (leftValue && rightValue) {
        var evaluator = new Function('left,right', `return left ${expression.operator} right;`) as (x, y) => any;
        node.setCalculatedValue(leftValue.product(rightValue, (leftValue, rightValue) => {
            if (isStrictEqual() || isEqual()) {
                const comparisionResult = leftValue.compareTo(rightValue, isStrictEqual());
                if (comparisionResult === ComparisonResult.TRUE) {
                    return maybeNegated(true);
                } else if (comparisionResult === ComparisonResult.FALSE) {
                    return maybeNegated(false);
                }
            }

            if (leftValue instanceof KnownValue && rightValue instanceof KnownValue) {
                return new KnownValue(evaluator(leftValue.value, rightValue.value));
            }
            return unknown;
        }));
    }

    function isStrictEqual():boolean {
        return expression.operator === '===' || expression.operator === '!==';
    }

    function isEqual():boolean {
        return expression.operator === '==' || expression.operator === '!=';
    }

    function maybeNegated(value:boolean):KnownValue {
        return new KnownValue(value === (expression.operator[0] === '='));
    }
});

feature.addPhase().after.onUnaryExpression((node:AstNode<UnaryExpression, any>) => {
    var expression = node.expression;
    var argument = expression.argument;
    var valueInformation = getValueInformation(argument);
    if (valueInformation) {
        var mapper = new Function('arg', `return ${expression.operator} arg;`) as (x) => any;
        node.setCalculatedValue(valueInformation.map(value => {
            if (value instanceof KnownValue) {
                return new KnownValue(mapper(value.value));
            } else { //ObjectValue
                if (expression.operator === '!') {
                    return new KnownValue(false);
                } else if (expression.operator === 'void') {
                    return new KnownValue(void 0);
                } else if (expression.operator === 'typeof') {
                    return new KnownValue((value as ObjectValue).objectClass === ObjectClass.Function ? 'function' : 'object');
                }
                return unknown;
            }
        }));
    }
});

export = feature;