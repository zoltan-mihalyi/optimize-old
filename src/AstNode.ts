import Scope = require("./Scope");
import {isBlockStatementLike, literalLike, isUnaryExpression, isLiteral} from "./Util";
import {Value, KnownValue, UnknownValue} from "./Value";
class AstNode<T extends Expression, S> {
    scope:Scope<S>;
    changed:boolean = false;
    replaced:boolean = false;

    constructor(public expression:T, public parent:AstNode<any,S>, private parentObject:any,
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

        if (Array.isArray(this.parentObject)) {
            var index = this.parentObject.indexOf(this.expression);
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
        this.changed = true;
        if (this.parent) {
            this.parent.markChanged();
        }
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