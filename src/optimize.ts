import recast = require('recast');
import removeExpressionStatements = require('./features/RemoveExpressionStatements');
import reduceTailRecursion = require('./features/ReduceTailRecursion');
import removeUnusedFunctions = require('./features/RemoveUnusedFunctions');
import {Feature, Phase, ASTPoint} from "./Feature";
import {isBlockStatementLike} from "./Util";
import Scope = require("./Scope");

function walk(expression: any, parent: ASTPoint<any>, scope: Scope<any>, phase: Phase<any>, scopeMap: Map<Expression,Scope<any>>) {
    if (typeof expression !== 'object' || expression === null) {
        return;
    }
    var isExpression = typeof expression.type === 'string';

    if (isExpression) {
        if (isBlockStatementLike(expression)) {
            if (scopeMap.has(expression)) {
                scope = scopeMap.get(expression);
            } else {
                scope = new Scope<any>(parent ? parent.expression : null, scope);
                scopeMap.set(expression, scope);
            }
        }

        var astPoint = new ASTPoint(expression, parent);
        phase.before.callAll(expression, astPoint, scope);

        for (let i in expression) {
            if (expression.hasOwnProperty(i) && i !== 'loc' && i !== 'original') {
                walkInner(expression, i);
            }
        }

        if (isExpression) {
            phase.after.callAll(expression, astPoint, scope);
        }
    } else {
        for (var i = 0; i < expression.length; i++) {
            var lengthBefore = expression.length;
            walkInner(expression, i);
            i -= lengthBefore - expression.length;
        }
    }

    function walkInner(expression: any, property: string|number) {
        walk(expression[property], isExpression ? astPoint : parent, scope, phase, scopeMap);
    }
}

var features: Feature<any>[] = [removeExpressionStatements, removeUnusedFunctions, reduceTailRecursion];

function walkFeature(feature: Feature<any>, ast: any) {

    var scopeMap = new Map<Expression,Scope<any>>();

    for (var j = 0; j < feature.phases.length; j++) {
        walk(ast, null, null, feature.phases[j], scopeMap);
    }
    return j;
}

export = function (code: string): string {
    var ast = recast.parse(code).program;

    for (var i = 0; i < features.length; i++) {
        walkFeature(features[i], ast);
    }

    return recast.print(ast).code;
};