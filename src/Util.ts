export function isLiteral(e:Expression):e is Literal {
    return e.type === 'Literal';
}

export function isDirective(e:Expression):e is Directive {
    return typeof (e as any).directive === 'string';
}

export function isIdentifier(e:Expression):e is Identifier {
    return e.type === 'Identifier';
}

export function isBlockStatement(e:Expression):e is BlockStatement {
    return e.type === 'BlockStatement';
}

export function isBlockStatementLike(e:Expression):e is BlockStatement {
    return isBlockStatement(e) || isProgram(e);
}

export function isFunctionDeclaration(e:Expression):e is FunctionDeclaration {
    return e.type === 'FunctionDeclaration';
}

export function isBinaryExpressionLike(e:Expression):e is BinaryExpression {
    return isBinaryExpression(e) || isLogicalExpression(e);
}

export function isBinaryExpression(e:Expression):e is BinaryExpression {
    return e.type === 'BinaryExpression';
}

export function isLogicalExpression(e:Expression):e is LogicalExpression {
    return e.type === 'LogicalExpression';
}

export function isProgram(e:Expression):e is Program {
    return e.type === 'Program';
}

export function isReturnStatement(e:Expression):e is ReturnStatement {
    return e.type === 'ReturnStatement';
}

export function isAssignmentExpression(e:Expression):e is AssignmentExpression {
    return e.type === 'AssignmentExpression';
}

export function isForInStatement(e:Expression):e is ForInStatement {
    return e.type === 'ForInStatement';
}

export function isVariableDeclarator(e:Expression):e is VariableDeclarator {
    return e.type === 'VariableDeclarator';
}

export function isCallExpression(e:Expression):e is CallExpression {
    return e.type === 'CallExpression';
}

export function isUpdateExpression(e:Expression):e is UpdateExpression {
    return e.type === 'UpdateExpression';
}

export function isExpressionStatement(e:Expression):e is ExpressionStatement {
    return e.type === 'ExpressionStatement';
}

export function returnStatement(argument?:Expression):ReturnStatement {
    return {
        type: 'ReturnStatement',
        argument: argument
    };
}

export function literalLike(value:any):Expression {
    if (value === void 0) {
        return unaryExpression('void', true, literal(0));
    }
    return literal(value);
}

export function unaryExpression(operator:string, prefix:boolean, argument:Expression):UnaryExpression {
    return {
        type: 'UnaryExpression',
        operator: operator,
        argument: argument,
        prefix: prefix
    };
}

export function literal(value:number):Literal {
    return {
        type: 'Literal',
        value: value,
        raw: value + ''
    };
}

export function whileStatement(test:Expression, body:Expression):WhileStatement {
    return {
        type: 'WhileStatement',
        test: test,
        body: body
    };
}

export function identifier(name:string):Identifier {
    return {
        type: 'Identifier',
        name: name
    };
}

export function labeled(name:string, body:Expression):LabeledStatement {
    return {
        type: 'LabeledStatement',
        body: body,
        label: identifier(name)
    };
}

export function block(body:Expression[]):BlockStatement {
    return {
        type: 'BlockStatement',
        body: body
    };
}

export function continueStatement(name:string):ContinueStatement {
    return {
        type: 'ContinueStatement',
        label: identifier(name)
    };
}

export function declarator(name:string, init?:Expression):VariableDeclarator {
    return {
        type: 'VariableDeclarator',
        id: identifier(name),
        init: init
    };
}

export function declaration(declarations:VariableDeclarator[]):VariableDeclaration {
    return {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: declarations
    };
}

export function assignment(left:Expression, right:Expression):ExpressionStatement {
    var assignment:AssignmentExpression = {
        type: 'AssignmentExpression',
        operator: '=',
        left: left,
        right: right
    };


    return {
        type: 'ExpressionStatement',
        expression: assignment
    };
}