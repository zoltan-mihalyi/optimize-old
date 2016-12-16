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

    onVariableDeclarator(callback:Callback<VariableDeclarator,T>) {
        this.on('VariableDeclarator', callback);
    }

    onAssignmentExpression(callback:Callback<AssignmentExpression,T>) {
        this.on('AssignmentExpression', callback);
    }

    onUpdateExpression(callback:Callback<UpdateExpression,T>) {
        this.on('UpdateExpression', callback);
    }

    onBinaryExpressionLike(callback:Callback<BinaryExpression,T>) {
        this.onBinaryExpression(callback);
        this.onLogicalExpression(callback);
    }

    onBinaryExpression(callback:Callback<BinaryExpression,T>) {
        this.on('BinaryExpression', callback);
    }

    onLogicalExpression(callback:Callback<LogicalExpression,T>) {
        this.on('LogicalExpression', callback);
    }

    onUnaryExpression(callback:Callback<UnaryExpression,T>) {
        this.on('UnaryExpression', callback);
    }

    onConditionalLike(callback:Callback<ConditionalExpression,T>) {
        this.on('ConditionalExpression', callback);
        this.on('IfStatement', callback);
    }

    onProgram(callback:Callback<Program,T>) {
        this.on('Program', callback);
    }

    onLabeledStatement(callback:Callback<LabeledStatement,T>) {
        this.on('LabeledStatement', callback);
    }

    onBlockStatementLike(callback:Callback<BlockStatement,T>) {
        this.on('BlockStatement', callback);
        this.on('Program', callback);
    }

    onMemberExpression(callback:Callback<MemberExpression,T>) {
        this.on('MemberExpression', callback);
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

