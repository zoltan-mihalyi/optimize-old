import {Feature} from "../Feature";
import {getValueInformation, isStaticMemberExpression, isLHS, safeValue} from "../Util";
import {ObjectValue, unknown, KnownValue} from "../Value";
import AstNode = require("../AstNode");

const feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onMemberExpression((node:AstNode<MemberExpression, any>) => {
    const expression = node.expression;

    if (isLHS(expression, node.parent.expression)) {
        return;
    }

    const objectValue = getValueInformation(expression.object);
    if (!objectValue) {
        return;
    }
    const propertyValue = isStaticMemberExpression(expression) ? new KnownValue(expression.property.name) : safeValue(expression.property);
    node.setCalculatedValue(objectValue.product(propertyValue, (objValue, propValue) => {
        if (objValue instanceof ObjectValue && propValue instanceof KnownValue) {
            return objValue.resolve(propValue.value);
        } else {
            return unknown;
        }
    }));
});

export = feature;