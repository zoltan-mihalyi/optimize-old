///<reference path="../interfaces.ts"/>
import {Feature} from "../Feature";
import {isBlockStatementLike, getValueInformation} from "../Util";
import {KnownValue} from "../Value";
import AstNode = require("../AstNode");

const feature:Feature<any> = new Feature<any>();

feature.addPhase().before.onConditionalLike((node:AstNode<IfStatement, any>) => {
    const expression = node.expression;
    const test = expression.test;
    const value = getValueInformation(test);
    if (value) {
        const boolValue = value.map(value => {
            if (value instanceof KnownValue) {
                return new KnownValue(!!value.value);
            } else { //ObjectValue
                return new KnownValue(true);
            }
        });
        if (boolValue instanceof KnownValue) {
            const block = boolValue.value ? expression.consequent : expression.alternate;
            if (block) {
                if (isBlockStatementLike(node.parent.expression) && isBlockStatementLike(block)) {
                    node.replaceWith(block.body);
                } else {
                    node.replaceWith([block]);
                }
            } else {
                node.remove();
            }
        }
    }
});

export = feature;