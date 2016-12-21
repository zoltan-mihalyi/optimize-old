export function returnStatement(argument?:Expression):ReturnStatement {
    return {
        type: 'ReturnStatement',
        argument: argument
    };
}

export function unaryExpression(operator:string, prefix:boolean, argument:Expression):UnaryExpression {
    return {
        type: 'UnaryExpression',
        operator: operator,
        argument: argument,
        prefix: prefix
    };
}

export function literal(value:number|string|boolean):Literal {
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

export function update(argument:Expression, operator:string, prefix:boolean):UpdateExpression {
    return {
        type: 'UpdateExpression',
        prefix: prefix,
        operator: operator,
        argument: argument
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

export function declaration(declarations:VariableDeclarator[], kind?:'var'|'let'|'const'):VariableDeclaration {
    return {
        type: 'VariableDeclaration',
        kind: kind || 'var',
        declarations: declarations
    };
}

export function expressionStatement(expression:Expression):ExpressionStatement {
    return {
        type: 'ExpressionStatement',
        expression: expression
    };
}

export function assignment(left:Expression, right:Expression):ExpressionStatement {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: left,
            right: right
        } as AssignmentExpression
    };
}

export function binaryExpression(operator:string, left:Expression, right:Expression):BinaryExpression {
    return {
        type: 'BinaryExpression',
        operator: operator,
        left: left,
        right: right
    };
}

export function call(callee:Expression, args:Expression[]):CallExpression {
    return {
        type: 'CallExpression',
        callee: callee,
        arguments: args
    };
}

export function callNew(callee:Expression, args:Expression[]):CallExpression {
    return {
        type: 'NewExpression',
        callee: callee,
        arguments: args
    };
}

export function throwStatement(argument:Expression):ThrowStatement {
    return {
        type: 'ThrowStatement',
        argument: argument
    };
}

export function switchStatement(discriminant:Expression, cases:SwitchCase[]):SwitchStatement {
    return {
        type: 'SwitchStatement',
        discriminant: discriminant,
        cases: cases
    };
}

export function memberExpression(object:Expression, property:Identifier, computed:boolean):MemberExpression {
    return {
        type: 'MemberExpression',
        object: object,
        property: property,
        computed: computed
    };
}

export function ifStatement(test:Expression, consequent:Expression, alternate:Expression):IfStatement {
    return {
        type: 'IfStatement',
        test: test,
        consequent: consequent,
        alternate: alternate
    };
}

export function array(elements:Expression[]):ArrayExpression {
    return {
        type: 'ArrayExpression',
        elements: elements
    };
}

export function forStatement(init:Expression, test:Expression, update:Expression, body:Expression):ForStatement {
    return {
        type: 'ForStatement',
        init: init,
        test: test,
        update: update,
        body: body
    };
}

export function forInStatement(left:Expression, right:Expression, body:Expression, of:boolean):ForInStatement {
    return {
        type: of ? 'ForOfStatement' : 'ForInStatement',
        left: left,
        right: right,
        body: body
    };
}

export function conditional(test:Expression, consequent:Expression, alternate:Expression):ConditionalExpression {
    return {
        type: 'ConditionalExpression',
        test: test,
        consequent: consequent,
        alternate: alternate
    };
}

export function object(properties:Property[]):ObjectExpression {
    return {
        type: 'ObjectExpression',
        properties: properties
    };
}

export function property(key:Expression, value:Expression, method:boolean, kind:'init', shorthand:boolean, computed:boolean):Property {
    return {
        type: 'Property',
        key: key,
        value: value,
        method: method,
        kind: kind,
        shorthand: shorthand,
        computed: computed
    };
}

export function literalLike(value:any):Expression {
    if (value === void 0) {
        return unaryExpression('void', true, literal(0));
    }
    return literal(value);
}