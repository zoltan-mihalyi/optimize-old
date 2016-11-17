import Scope = require("./Scope");
import AstNode = require("./AstNode");
type Callback<E extends Expression, S> = (e:AstNode<E, S>)=>void;

class FeatureStore<T> {
    private store:{[idx:string]:Callback<Expression,T>[]} = Object.create(null);

    callAll(astNode:AstNode<any,any>):void {
        var callbacks:Callback<Expression,T>[] = this.store[astNode.expression.type];
        if (callbacks) {
            for (var i = 0; i < callbacks.length; i++) {
                var callback = callbacks[i];
                callback(astNode);
            }
        }
    }

    onFunctionDeclaration(callback:Callback<FunctionDeclaration,T>) {
        this.on('FunctionDeclaration', callback);
    }

    onCallExpression(callback:Callback<CallExpression,T>) {
        this.on('CallExpression', callback);
    }

    onIdentifier(callback:Callback<Identifier,T>) {
        this.on('Identifier', callback);
    }

    onExpressionStatement(callback:Callback<ExpressionStatement,T>) {
        this.on('ExpressionStatement', callback);
    }

    private on(type:string, callback:Callback<Expression,T>) {
        if (!this.store[type]) {
            this.store[type] = [callback];
        } else {
            this.store[type].push(callback);
        }
    }
}

export class Phase<T> {
    public before:FeatureStore<T> = new FeatureStore<T>();
    public after:FeatureStore<T> = new FeatureStore<T>();
}

export class Feature<T> {
    phases:Phase<T>[] = [];

    addPhase():Phase<T> {
        var phase = new Phase();
        this.phases.push(phase);
        return phase;
    }
}

