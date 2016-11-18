import recast = require('recast');
import removeExpressionStatements = require('./features/RemoveExpressionStatements');
import reduceTailRecursion = require('./features/ReduceTailRecursion');
import removeUnusedFunctions = require('./features/RemoveUnusedFunctions');
import inlineExpression = require('./features/InlineExpression');
import calculateArithmetic = require('./features/CalculateArithmetic');
import reduceConditionals = require('./features/ReduceConditionals');
import reduceLogical = require('./features/ReduceLogical');
import {Feature, Phase} from "./Feature";
import Scope = require("./Scope");
import AstNode = require("./AstNode");

var features:Feature<any>[] = [
    removeExpressionStatements,
    removeUnusedFunctions,
    reduceTailRecursion,
    inlineExpression,
    calculateArithmetic,
    reduceConditionals,
    reduceLogical
];

class Walker {
    private scopeMap = new Map<Expression,Scope<any>>();

    walk(expression:Expression, phase:Phase<any>):boolean {
        var astNode = new AstNode(expression, null, null, this.scopeMap);
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
                    for (var j = 0; j < sub.length; j++) {
                        var obj = sub[j];
                        if (typeof  obj.type === 'string') {
                            var lengthBefore = sub.length;
                            this.walkInner(new AstNode(obj, astNode, sub, this.scopeMap), phase);
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
    var changed = false;
    var walker = new Walker();

    for (var j = 0; j < feature.phases.length; j++) {
        changed = changed || walker.walk(expression, feature.phases[j]);
    }
    return changed;
}

export = function (code:string):string {
    var ast:Expression = recast.parse(code).program;

    var needRun = true;
    while (needRun) {
        needRun = false;
        for (var i = 0; i < features.length; i++) {
            needRun = needRun || walkFeature(features[i], ast);
        }
    }

    return recast.print(ast, {
        lineTerminator: '\n'
    }).code;
};