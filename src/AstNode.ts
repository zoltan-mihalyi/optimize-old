import Scope = require("./Scope");
import {isBlockStatementLike} from "./Util";
class AstNode<T extends Expression, S> {
    scope:Scope<S>;
    changed:boolean = false;

    constructor(public expression:T, public parent:AstNode<any,S>, private parentObject:any, scopeMap:Map<Expression, Scope<any>>, private property?:string,) {
        if (isBlockStatementLike(expression)) {
            if (scopeMap.has(expression)) {
                this.scope = scopeMap.get(expression);
            } else {
                this.scope = new Scope<any>(parent ? parent.expression : null, parent ? parent.scope : null);
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
        this.markChanged();
    }

    private markChanged() {
        this.changed = true;
        if (this.parent) {
            this.parent.markChanged();
        }
    }

}

export = AstNode;