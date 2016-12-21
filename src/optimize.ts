import recast = require('recast');
import removeExpressionStatements = require('./features/RemoveExpressionStatements');
import calculateArithmetic = require('./features/CalculateArithmetic');
import resolvePropertyAccess = require('./features/ResolvePropertyAccess');
import reduceConditionals = require('./features/ReduceConditionals');
import reduceSwitchCase = require('./features/ReduceSwitchCase');
import reduceLogical = require('./features/ReduceLogical');
import valueTracker = require('./features/ValueTracker/ValueTracker');
import unrollForIn = require('./features/UnrollForIn');
import removeBlock = require('./features/RemoveBlock');
import {Feature, Phase} from "./Feature";
import Scope = require("./Scope");
import AstNode = require("./AstNode");

const features:Feature<any>[] = [
    removeExpressionStatements,
    calculateArithmetic,
    resolvePropertyAccess,
    reduceConditionals,
    reduceSwitchCase,
    reduceLogical,
    valueTracker,
    unrollForIn,
    removeBlock
];

class Walker {
    private scopeMap = new Map<Expression,Scope<any>>();

    walk(expression:Expression, phase:Phase<any>):boolean {
        const astNode = new AstNode(expression, null, null, this.scopeMap);
        this.walkInner(astNode, phase);
        return astNode.changed;
    }

    private walkInner(astNode:AstNode<any,any>, phase:Phase<any>) {
        phase.before.callAll(astNode);

        let expression = astNode.expression;
        for (let i in expression) {
            if (expression.hasOwnProperty(i)) {
                let sub = expression[i];
                if (!sub) {
                    continue;
                }
                if (typeof sub.type === 'string') {
                    this.walkInner(new AstNode(sub, astNode, expression, this.scopeMap, i), phase);
                } else if (typeof sub.length === 'number') {
                    for (let j = 0; j < sub.length; j++) {
                        const obj = sub[j];
                        if (typeof  obj.type === 'string') {
                            const lengthBefore = sub.length;
                            this.walkInner(new AstNode(obj, astNode, sub, this.scopeMap), phase);
                            if (astNode.replaced) {
                                break;
                            }
                            j -= lengthBefore - sub.length;
                        }
                    }
                }

            }
        }

        phase.after.callAll(astNode);
    }
}

function walkFeature(feature:Feature<any>, expression:Expression):boolean {
    let changed = false;
    const walker = new Walker();

    for (let i = 0; i < feature.phases.length; i++) {
        changed = changed || walker.walk(expression, feature.phases[i]);
    }
    return changed;
}

export = function (code:string):string {
    const ast:Expression = recast.parse(code).program;

    let needRun = true;
    while (needRun) {
        needRun = false;
        for (let i = 0; i < features.length; i++) {
            needRun = needRun || walkFeature(features[i], ast);
        }
    }

    return recast.print(ast, {
        lineTerminator: '\n'
    }).code;
};