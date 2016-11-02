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

export function isBinaryExpression(e:Expression):e is BinaryExpression {
    return e.type === 'BinaryExpression';
}

export function isProgram(e:Expression):e is Program {
    return e.type === 'Program';
}
