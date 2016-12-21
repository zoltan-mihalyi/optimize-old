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

function isFunctionDeclaration(e:Expression):e is FunctionDeclaration {
    return e.type === 'FunctionDeclaration';
}

function isFunctionExpression(e:Expression):e is FunctionExpression {
    return e.type === 'FunctionExpression';
}

function isArrowFunctionExpression(e:Expression):e is ArrowFunctionExpression {
    return e.type === 'ArrowFunctionExpression';
}

export function isFunctionLike(e:Expression):e is FunctionDeclaration {
    return isFunctionDeclaration(e) || isFunctionExpression(e) || isArrowFunctionExpression(e);
}

export function isBinaryExpressionLike(e:Expression):e is BinaryExpression {
    return isBinaryExpression(e) || isLogicalExpression(e);
}

export function isBinaryExpression(e:Expression):e is BinaryExpression {
    return e.type === 'BinaryExpression';
}

export function isUnaryExpression(e:Expression):e is UnaryExpression {
    return e.type === 'UnaryExpression';
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

export function isForOfStatement(e:Expression):e is ForOfStatement {
    return e.type === 'ForOfStatement';
}

export function isVariableDeclarator(e:Expression):e is VariableDeclarator {
    return e.type === 'VariableDeclarator';
}

export function isVariableDeclaration(e:Expression):e is VariableDeclaration {
    return e.type === 'VariableDeclaration';
}

export function isCallExpression(e:Expression):e is CallExpression {
    return e.type === 'CallExpression';
}

export function isNewExpression(e:Expression):e is NewExpression {
    return e.type === 'NewExpression';
}

export function isThrow(e:Expression):e is ThrowStatement {
    return e.type === 'ThrowStatement';
}

export function isSwitch(e:Expression):e is SwitchStatement {
    return e.type === 'SwitchStatement';
}

export function isCase(e:Expression):e is SwitchCase {
    return e.type === 'SwitchCase';
}

export function isUpdateExpression(e:Expression):e is UpdateExpression {
    return e.type === 'UpdateExpression';
}

export function isExpressionStatement(e:Expression):e is ExpressionStatement {
    return e.type === 'ExpressionStatement';
}

export function isWhileStatement(e:Expression):e is WhileStatement {
    return e.type === 'WhileStatement';
}

export function isDoWhileStatement(e:Expression):e is DoWhileStatement {
    return e.type === 'DoWhileStatement';
}

export function isForStatement(e:Expression):e is ForStatement {
    return e.type === 'ForStatement';
}

export function isArrayExpression(e:Expression):e is ArrayExpression {
    return e.type === 'ArrayExpression';
}

export function isMemberExpression(e:Expression):e is MemberExpression {
    return e.type === 'MemberExpression';
}

export function isIfStatement(e:Expression):e is IfStatement {
    return e.type === 'IfStatement';
}

export function isConditionalExpression(e:Expression):e is ConditionalExpression {
    return e.type === 'ConditionalExpression';
}

export function isLabeledStatement(e:Expression):e is LabeledStatement {
    return e.type === 'LabeledStatement';
}

export function isObjectExpression(e:Expression):e is ObjectExpression {
    return e.type === 'ObjectExpression';
}

export function isProperty(e:Expression):e is Property {
    return e.type === 'Property';
}

export function isThis(e:Expression) {
    return e.type === 'ThisExpression';
}

export function isTryStatement(e:Expression):e is TryStatement {
    return e.type === 'TryStatement';
}

export function isBreak(e:Expression):e is BreakStatement {
    return e.type === 'BreakStatement';
}


export function isBlockStatementLike(e:Expression):e is BlockStatement {
    return isBlockStatement(e) || isProgram(e);
}

export function isForInStatementLike(e:Expression):e is ForInStatement {
    return isForInStatement(e) || isForOfStatement(e);
}

export function isLoop(e):e is Loop {
    return isWhileStatement(e) || isForInStatement(e) || isForOfStatement(e) || isForStatement(e) || isDoWhileStatement(e);
}

export function isStaticMemberExpression(e:MemberExpression):e is StaticMemberExpression {
    return !e.computed;
}

export function isStaticProperty(e:Property):e is StaticProperty {
    return e.computed === false;
}

export function isBlockScoped(e:VariableDeclaration):boolean {
    return e.kind !== 'var';
}
