import Scope = require("./Scope");
import {Value, KnownValue, UnknownValue} from "./Value";
import {literalLike} from "./util/Builders";
import {isBlockStatementLike, isUnaryExpression, isLiteral} from "./util/TypeCheckers";
import recast = require('recast');
import OptimizeContext = require("./optimize");

class AstNode<T extends Expression, S> {
    scope:Scope<S>;
    replaced:boolean = false;

    constructor(public context:OptimizeContext, public expression:T, public parent:AstNode<any,S>, private parentObject:any,
                scopeMap:Map<Expression, Scope<any>>, private property?:string,) {
        if (isBlockStatementLike(expression)) {
            if (scopeMap.has(expression)) {
                this.scope = scopeMap.get(expression);
            } else {
                this.scope = new Scope<any>(expression, parent ? parent.expression : null, parent ? parent.scope : null);
                scopeMap.set(expression, this.scope);
            }
        } else {
            this.scope = parent.scope;
        }
    }

    remove():void {
        this.replaceWith([]);
    }

    replaceWith(expressions:Expression[]):void {
        if (!this.parent) {
            throw new Error('Parent does not exist.');
        }

        let originalCode = recast.print(this.expression).code;
        let newCode = expressions.map(e => recast.print(e).code).join('\n');

        let growth = newCode.length - originalCode.length;

        if (growth > this.context.options.maxGrowth) {
            console.log('Replace growth ' + growth + ' is bigger than maximum: ' + this.context.options.maxGrowth);
            return;
        }

        if (this.context.growth + growth > this.context.options.maxTotalGrowth) {
            console.log('Total growth would be bigger than maximum!');
            return;
        }

        this.context.growth += growth;


        console.log('replace ' + originalCode + ' with ' + newCode);

        if (Array.isArray(this.parentObject)) {
            const index = this.parentObject.indexOf(this.expression);
            this.parentObject.splice.apply(this.parentObject, [index, 1, ...expressions]);
        } else {
            if (expressions.length !== 1) {
                throw new Error('Must be 1.');
            }
            this.parentObject[this.property] = expressions[0];
        }
        this.replaced = true;
        this.markChanged();
    }

    setCalculatedValue(value:Value) {
        const expression = this.expression;
        if (value instanceof KnownValue) {
            if (canReplaceWithLiteral(value, expression)) {
                this.replaceWith([literalLike(value.value)]);
                return;
            }
        } else if (value instanceof UnknownValue) {
            return;
        }
        if (!expression.calculatedValue || !value.equals(expression.calculatedValue)) {
            expression.calculatedValue = value;
            this.markChanged();
        }
    }

    private markChanged() {
        this.context.changed = true;
    }
}

function canReplaceWithLiteral(value:KnownValue, expression:Expression):boolean {
    if (value.value === void 0 && isVoid0(expression)) {
        return false; //already void 0
    }
    return !(value.value instanceof RegExp);

}

function isVoid0(expression:Expression):boolean {
    return isUnaryExpression(expression) && isLiteral(expression.argument) && expression.argument.value === 0;
}

export = AstNode;