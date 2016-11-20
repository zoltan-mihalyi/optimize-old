import {Feature} from "../Feature";
import {isBlockStatementLike, getValueInformation} from "../Util";
import {KnownValue} from "../Value";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().before.onIfStatement((node:AstNode<IfStatement, any>)=> {
    var expression = node.expression;
    var test = expression.test;
    var value = getValueInformation(test);
    if (value) {
        var boolValue = value.map(x=>!!x);
        if (boolValue instanceof KnownValue) {
            var block = boolValue.value ? expression.consequent : expression.alternate;
            if (isBlockStatementLike(node.parent.expression) && isBlockStatementLike(block)) {
                node.replaceWith(block.body);
            } else {
                node.replaceWith([block]);
            }
        }
    }
});

export = feature;