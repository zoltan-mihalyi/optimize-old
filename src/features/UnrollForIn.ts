///<reference path="../interfaces.ts"/>
import {Feature} from "../Feature";
import {
    safeValue,
    assignment,
    literal,
    declaration,
    isVariableDeclaration,
    declarator,
    isBlockStatement,
    copy,
    block
} from "../Util";
import {ObjectValue} from "../Value";
import AstNode = require("../AstNode");

const feature:Feature<any> = new Feature<any>();

feature.addPhase().after.onForInStatement((node:AstNode<ForInStatement, any>) => {
    const right = node.expression.right;
    const body = node.expression.body;
    const rightValue = safeValue(right);

    if (rightValue instanceof ObjectValue) {
        const unrolled:Expression[] = [];
        let left = node.expression.left;

        if (!rightValue.canIterate()) {
            return;
        }

        rightValue.iterate((key:string) => {
            let setLoopVariable = isVariableDeclaration(left) ? declaration([declarator(left.declarations[0].id.name, literal(key))], left.kind) : assignment(left, literal(key));

            const newBlockStatements = [];

            newBlockStatements.push(setLoopVariable);
            if (isBlockStatement(body)) {
                newBlockStatements.push.apply(newBlockStatements, copy(body.body));
            } else {
                newBlockStatements.push(copy(body));
            }

            unrolled.push(block(newBlockStatements));
        });

        node.replaceWith(unrolled);
    }
});

export = feature;