import LocalValue = require("./LocalValue");
import AstNode = require("../../AstNode");
import {Value} from "../../Value";
import {isFunctionLike, isLoop} from "../../Util";
class Variable {
    private writesFromFunctionOnly:boolean = true;
    private accessFromFunctionOnly:boolean = true;
    private writesInLoops:Expression[] = [];
    private values:LocalValue[] = [];
    private usedSources:Expression[] = [];

    constructor(node:AstNode<Expression,any>, letExpression:boolean, value:Value, public functionDeclaration?:FunctionDeclaration) {
        this.values.push({
            scope: node.scope.getScope(letExpression).getExpression(),
            sources: [node.expression],
            value: value
        });
    }

    setWriteInfo(modified:Identifier, node:AstNode<Expression,any>):void {
        let current = node;
        while (current.parent) {
            current = current.parent;
            if (isFunctionLike(current.expression)) {
                break;
            }
            if (isLoop(current.expression)) {
                this.writesInLoops.push(current.expression);
            }
        }

        if (!node.scope.hasInCurrentFunction(modified)) {
            this.writesFromFunctionOnly = false;
            this.accessFromFunctionOnly = false;
        }
    }

    merge(newScopes:Expression[]):void {
        const lastIndex = this.findFirstDifferent(newScopes);
        let i = this.values.length - 1;

        while (i >= lastIndex) {
            mergeOne(this.values[i - 1], this.values[i]);
            this.values.pop();
            i--;
        }
    }

    private findFirstDifferent(newScopes:Expression[]):number {
        for (let i = 0; i < this.values.length; i++) {
            const localValue = this.values[i];
            if (localValue.scope !== null && newScopes.indexOf(localValue.scope) === -1) {
                return i;
            }
        }
        return this.values.length;
    }

    topValue():LocalValue {
        return this.values[this.values.length - 1];
    }

    markUsed(node:AstNode<Identifier, any>) {
        const sources = this.topValue().sources;
        for (let i = 0; i < sources.length; i++) {
            const obj = sources[i];
            if (this.usedSources.indexOf(obj) === -1) {
                this.usedSources.push(obj);
            }
        }

        if (!node.scope.hasInCurrentFunction(node.expression)) {
            this.accessFromFunctionOnly = false;
        }
    }

    isSafe(writeOnly:boolean):boolean {
        return writeOnly ? this.writesFromFunctionOnly : this.accessFromFunctionOnly;
    }

    canBeModifiedInLoop(node:AstNode<Expression,any>):boolean {
        let current = node;
        while (current.parent) {
            current = current.parent;
            if (this.writesInLoops.indexOf(current.expression) !== -1) {
                return true;
            }
        }
        return false;
    }

    isUsed(expression:Expression):boolean {
        return this.usedSources.indexOf(expression) !== -1
    }

    updateValue(scope:Expression, expression:Expression, value:Value, replace:boolean) {
        let topValue = this.topValue();
        if (topValue.scope === scope) {
            if (replace) {
                topValue.sources = [topValue.sources[0], expression];
            } else {
                topValue.sources.push(expression);
            }
            topValue.value = value;
        } else {
            this.values.push({
                scope: scope,
                sources: [expression],
                value: value
            });
        }

    }
}


function mergeOne(oldValue:LocalValue, newValue:LocalValue) {
    Array.prototype.push.apply(oldValue.sources, newValue.sources);
    oldValue.value = oldValue.value.or(newValue.value);
}


export = Variable;