///<reference path="../interfaces.ts"/>
import {Feature} from "../Feature";
import {isVariableDeclaration, isBlockScoped, isBlockStatementLike} from "../Util";
import AstNode = require("../AstNode");

const feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onBlockStatement((node:AstNode<BlockStatement, any>) => {
    const body = node.expression.body;
    for (let i = 0; i < body.length; i++) {
        const expression = body[i];
        if (isVariableDeclaration(expression) && isBlockScoped(expression)) {
            return;
        }
    }

    if (isBlockStatementLike(node.parent.expression)) {
        node.replaceWith(body);
    }
});

export = feature;