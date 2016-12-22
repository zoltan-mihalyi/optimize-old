///<reference path="optimize-interfaces.ts"/>
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
import defaultOptions = require("./default-options");

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

    walk(context:OptimizeContext, expression:Expression, phase:Phase<any>) {
        const astNode = new AstNode(context, expression, null, null, this.scopeMap);
        this.walkInner(astNode, phase);
    }

    private walkInner(astNode:AstNode<any,any>, phase:Phase<any>) {
        phase.before.callAll(astNode);

        let expression = astNode.expression;
        for (let i in expression) {
            if (!expression.hasOwnProperty(i)) {
                continue;
            }
            let sub = expression[i];
            if (!sub) {
                continue;
            }
            if (typeof sub.type === 'string') {
                this.walkInner(new AstNode(astNode.context, sub, astNode, expression, this.scopeMap, i), phase);
            } else if (typeof sub.length === 'number') {
                for (let j = 0; j < sub.length; j++) {
                    const obj = sub[j];
                    if (typeof  obj.type === 'string') {
                        const lengthBefore = sub.length;
                        this.walkInner(new AstNode(astNode.context, obj, astNode, sub, this.scopeMap), phase);
                        if (astNode.replaced) {
                            break;
                        }
                        j -= lengthBefore - sub.length;
                    }
                }
            }
        }

        phase.after.callAll(astNode);
    }
}

function walkFeature(context:OptimizeContext, feature:Feature<any>, expression:Expression) {
    const walker = new Walker();

    for (let i = 0; i < feature.phases.length; i++) {
        walker.walk(context, expression, feature.phases[i]);
    }
}

export = function (code:string, options?:OptimizeOptions):string {
    let actualOptions:OptimizeOptions;
    if (!options) {
        actualOptions = defaultOptions;
    } else {
        actualOptions = {} as OptimizeOptions;
        for (const i in defaultOptions) {
            actualOptions[i] = options.hasOwnProperty(i) ? options[i] : defaultOptions[i];
        }
    }

    const ast:Expression = recast.parse(code).program;

    let context:OptimizeContext = {
        options: actualOptions,
        growth: 0,
        changed: true
    };
    while (context.changed) {
        context.changed = false;
        for (let i = 0; i < features.length; i++) {
            walkFeature(context, features[i], ast);
        }
    }

    return recast.print(ast, {
        lineTerminator: '\n'
    }).code;
};