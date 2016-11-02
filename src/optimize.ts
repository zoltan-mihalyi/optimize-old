import recast = require('recast');
import removeExpressionStatements = require('./features/RemoveExpressionStatements');
import removeUnusedFunctions = require('./features/RemoveUnusedFunctions');
import {Feature} from "./Feature";
import {isBlockStatementLike} from "./Util";
import Scope = require("./Scope");

function walk(expression:any, parent:Expression, scope:Scope<any>, feature:Feature<any>) {
    if (typeof expression !== 'object' || expression === null) {
        return;
    }
    var isExpression = typeof expression.type === 'string';

    if (isExpression) {
        if (isBlockStatementLike(expression)) {
            scope = new Scope<any>(parent, scope);
        }

        feature.before.callAll(expression, parent, scope);

        for (let i in expression) {
            if (expression.hasOwnProperty(i) && i !== 'loc' && i !== 'original') {
                walkInner(expression, i);
            }
        }

        if (isExpression) {
            feature.after.callAll(expression, parent, scope);
        }


    } else {
        for (var i = 0; i < expression.length; i++) {
            var lengthBefore = expression.length;
            walkInner(expression, i);
            i -= lengthBefore - expression.length;
        }
    }

    function walkInner(expression:any, property:string|number) {
        walk(expression[property], isExpression ? expression : parent, scope, feature);
    }
}

var features:Feature<any>[] = [removeExpressionStatements, removeUnusedFunctions];

export = function (code:string):string {
    var ast = recast.parse(code).program;

    for (var i = 0; i < features.length; i++) {
        walk(ast, null, null, features[i]);
    }

    return recast.print(ast).code;
};