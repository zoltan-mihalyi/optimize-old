import LocalValue = require("./LocalValue");
import AstNode = require("../../AstNode");
import {Value} from "../../Value";
import {isFunctionLike, isLoop} from "../../util/TypeCheckers";
class Variable {
    private writesFromFunctionOnly:boolean = true;
    private accessFromFunctionOnly:boolean = true;
    private writesInLoops:Expression[] = [];
    private values:LocalValue[] = [];
    private usedSources:Expression[] = [];
    private usages:number = 0;

    constructor(node:AstNode<Expression,any>, blockScoped:boolean, value:Value, private initialized:boolean, public functionDeclaration?:FunctionDeclaration) {
        this.values.push({
            scope: node.scope.getScope(blockScoped).getExpression(),
            sources: [node.expression],
            value: value
        });
    }

    setAccessInfo(modified:Identifier, node:AstNode<Expression,any>, write:boolean):void {
        if (write) {
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
        }

        if (!node.scope.hasInCurrentFunction(modified)) {
            if (write) {
                this.writesFromFunctionOnly = false;
            }
            this.accessFromFunctionOnly = false;
        }
        this.usages++;
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

    topValue():LocalValue {
        return this.values[this.values.length - 1];
    }

    markUsed() {
        const sources = [this.values[0].sources[0], ...this.topValue().sources];
        for (let i = 0; i < sources.length; i++) {
            const obj = sources[i];
            if (this.usedSources.indexOf(obj) === -1) {
                this.usedSources.push(obj);
            }
        }
    }

    getUsages():number {
        return this.usages;
    }

    isSafe(writeOnly:boolean):boolean {
        return writeOnly ? this.writesFromFunctionOnly : this.accessFromFunctionOnly;
    }

    canBeModifiedInLoop(node?:AstNode<Expression,any>):boolean {
        if (!node) {
            return this.writesInLoops.length > 0;
        }

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
        return this.usages > 0 && this.usedSources.indexOf(expression) !== -1;
    }

    isInitialized():boolean {
        return this.initialized;
    }

    updateValue(scope:Expression, expression:Expression, value:Value, replace:boolean, skipInit?:boolean) {
        if (!skipInit) {
            this.initialized = true;
        }
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

    private findFirstDifferent(newScopes:Expression[]):number {
        for (let i = 0; i < this.values.length; i++) {
            const localValue = this.values[i];
            if (localValue.scope !== null && newScopes.indexOf(localValue.scope) === -1) {
                return i;
            }
        }
        return this.values.length;
    }
}


function mergeOne(oldValue:LocalValue, newValue:LocalValue) {
    Array.prototype.push.apply(oldValue.sources, newValue.sources);
    oldValue.value = oldValue.value.or(newValue.value);
}


export = Variable;