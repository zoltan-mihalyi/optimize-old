import {Feature} from "../Feature";
import {isBreak} from "../util/TypeCheckers";
import {safeValue, contains} from "../util/Others";
import {SingleValue, ComparisonResult} from "../Value";
import AstNode = require("../AstNode");

const feature:Feature<any> = new Feature<any>();
feature.addPhase().before.onSwitchStatement((node:AstNode<SwitchStatement, any>) => {
    const expression = node.expression;
    const discriminantValue = safeValue(expression.discriminant);
    if (discriminantValue instanceof SingleValue) {
        const matchingCase = getMatchingCase(discriminantValue, expression.cases, false);
        if (matchingCase) {
            replace(expression.cases, expression.cases.indexOf(matchingCase), node, []);
        } else if (matchingCase === null) {
            node.replaceWith([]);
        }
    }//todo handle when all value are mapped to default
});

function getMatchingCase(discriminantValue:SingleValue, cases:SwitchCase[], findDefault:boolean):SwitchCase {
    for (let i = 0; i < cases.length; i++) {
        const caseExpression = cases[i];

        if (caseExpression.test === null) {
            if (findDefault) {
                return caseExpression;
            }
            continue;
        }
        if (findDefault) {
            continue;
        }

        const caseValue = safeValue(caseExpression.test);
        if (caseValue instanceof SingleValue) {
            let comparisonResult = caseValue.compareTo(discriminantValue, true);
            if (comparisonResult === ComparisonResult.UNKNOWN) {
                return void 0;
            }
            if (comparisonResult === ComparisonResult.TRUE) {
                return caseExpression;
            }
        } else {
            return void 0;
        }
    }

    if (!findDefault) {
        return getMatchingCase(discriminantValue, cases, true);
    }
    return null;
}

function replace(cases:SwitchCase[], i:number, node:AstNode<SwitchStatement, any>, previous:Expression[]) { //todo refactor
    let statements:Expression[];
    if (i >= cases.length) {
        statements = previous;
    } else {
        const currentStatements = cases[i].consequent;
        if (contains(currentStatements.slice(0, -1), isBreak)) {
            return;
        }
        statements = previous.concat(currentStatements);
        if (currentStatements.length === 0 || !isBreak(currentStatements[currentStatements.length - 1])) {
            return replace(cases, i + 1, node, statements);
        }
    }
    let items = isBreak(statements[statements.length - 1]) ? statements.slice(0, -1) : statements;
    node.replaceWith(items);
}

export = feature;