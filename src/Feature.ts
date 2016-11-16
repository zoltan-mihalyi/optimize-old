import Scope = require("./Scope");
import {isBlockStatementLike} from "./Util";
type Callback<E extends Expression,S> = (e: ASTPoint<E>, scope: Scope<S>)=>void;

export class ASTPoint<T extends Expression> {
    constructor(public expression: T, public parent?: ASTPoint<any>) {
    }

    remove(): void {
        this.replaceWith([]);
    }

    replaceWith(expressions: Expression[]): void {
        if (!this.parent) {
            throw new Error('Parent does not exist.');
        }

        var parentExpression = this.parent.expression;
        if (parentExpression && isBlockStatementLike(parentExpression)) {
            var index = parentExpression.body.indexOf(this.expression);
            parentExpression.body.splice.apply(parentExpression.body, [index, 1, ...expressions]);
        } else {
            throw new Error('Parent is not block');
        }
    }
}

class FeatureStore<T> {
    private store: {[idx: string]: Callback<Expression,T>[]} = Object.create(null);

    callAll(e: Expression, astPoint: ASTPoint<any>, scope: Scope<any>): void {
        var callbacks: Callback<Expression,T>[] = this.store[e.type];
        if (callbacks) {
            for (var i = 0; i < callbacks.length; i++) {
                var callback = callbacks[i];
                callback(astPoint, scope);
            }
        }
    }

    onFunctionDeclaration(callback: Callback<FunctionDeclaration,T>) {
        this.on('FunctionDeclaration', callback);
    }

    onCallExpression(callback: Callback<CallExpression,T>) {
        this.on('CallExpression', callback);
    }

    onIdentifier(callback: Callback<Identifier,T>) {
        this.on('Identifier', callback);
    }

    onExpressionStatement(callback: Callback<ExpressionStatement,T>) {
        this.on('ExpressionStatement', callback);
    }

    private on(type: string, callback: Callback<Expression,T>) {
        if (!this.store[type]) {
            this.store[type] = [callback];
        } else {
            this.store[type].push(callback);
        }
    }
}

export class Phase<T> {
    public before: FeatureStore<T> = new FeatureStore<T>();
    public after: FeatureStore<T> = new FeatureStore<T>();
}

export class Feature<T> {
    phases: Phase<T>[] = [];

    addPhase(): Phase<T> {
        var phase = new Phase();
        this.phases.push(phase);
        return phase;
    }
}

