import Scope = require("./Scope");
import {isBlockStatementLike} from "./Util";
type Callback<E extends Expression,S> = (e:ASTPoint<E>, scope:Scope<S>)=>void;

export class ASTPoint<T extends Expression> {
    constructor(public expression:T, private parent?:BlockStatement) {
    }

    remove():void {
        if (this.parent) {
            this.parent.body.splice(this.parent.body.indexOf(this.expression), 1);
        } else {
            throw new Error('Parent does not exist.');
        }
    }
}

class FeatureStore<T> {
    private store:{[idx:string]:Callback<Expression,T>[]} = Object.create(null);

    callAll(e:Expression, parent:Expression, scope:Scope<any>):void {
        var callbacks:Callback<Expression,T>[] = this.store[e.type];
        if (!callbacks) {
            return;
        }
        for (var i = 0; i < callbacks.length; i++) {
            var callback = callbacks[i];
            callback(new ASTPoint(e, isBlockStatementLike(parent) ? parent : null), scope);
        }
    }

    onFunctionDeclaration(callback:Callback<FunctionDeclaration,T>) {
        this.on('FunctionDeclaration', callback);
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


export class Feature<T> {

    public before:FeatureStore<T> = new FeatureStore<T>();
    public after:FeatureStore<T> = new FeatureStore<T>();

}