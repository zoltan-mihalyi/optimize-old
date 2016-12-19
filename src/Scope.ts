import {isFunctionLike} from "./Util";
class Scope<T> {
    private store:{[idx:string]:T} = Object.create(null);
    private functionScope:boolean;

    constructor(private expression:Expression, private parentExpression:Expression, private parent:Scope<T>) {
        this.functionScope = parent === null || isFunctionLike(parentExpression);
    }

    save(id:Identifier, object:T, blockScoped:boolean):void {
        this.getScope(blockScoped).store[id.name] = object;
    }

    getScope(letExpression:boolean):Scope<T> {
        if (!letExpression && !this.functionScope) {
            return this.parent.getScope(letExpression);
        }
        return this;
    }

    getExpression() {
        return this.expression;
    }

    get(id:Identifier):T {
        if (this.hasInCurrentBlock(id)) {
            return this.store[id.name];
        } else if (this.parent) {
            return this.parent.get(id);
        } else {
            return null;
        }
    }

    hasInCurrentBlock(id:Identifier):boolean {
        return Object.prototype.hasOwnProperty.call(this.store, id.name);
    }

    hasInCurrentFunction(id:Identifier):boolean {
        if (this.hasInCurrentBlock(id)) {
            return true;
        } else if (!this.functionScope && this.parent) {
            return this.parent.hasInCurrentFunction(id);
        }
        return false;
    }

    inside(fd:FunctionDeclaration):boolean {
        if (this.parentExpression === fd) {
            return true;
        } else if (this.parent) {
            return this.parent.inside(fd);
        }
        return false;
    }

    isCurrent(fd:FunctionDeclaration) {
        if (this.functionScope) {
            return this.parentExpression === fd;
        } else {
            return this.parent.isCurrent(fd);
        }
    }

    isGlobal(id?:Identifier) {
        if(!id){
            return !this.parent;
        }

        if (!this.parent) {
            return true;
        }
        if (this.hasInCurrentBlock(id)) {
            return false;
        } else {
            return this.parent.isGlobal(id);
        }
    }
}

export = Scope;