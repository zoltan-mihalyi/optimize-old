import {Feature} from "../Feature";
import {isLiteral, isBlockStatementLike} from "../Util";
import Scope = require("../Scope");
import AstNode = require("../AstNode");

var feature:Feature<any> = new Feature<any>();

feature.addPhase().before.onIfStatement((node:AstNode<IfStatement, any>)=> {
    var expression = node.expression;
    var test = expression.test;
    if (isLiteral(test)) {
        var block = test.value ? expression.consequent : expression.alternate;
        if (isBlockStatementLike(node.parent.expression) && isBlockStatementLike(block)) {
            node.replaceWith(block.body);
        } else {
            node.replaceWith([block]);
        }
    }
});

export = feature;