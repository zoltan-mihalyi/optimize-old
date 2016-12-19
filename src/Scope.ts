import {isFunctionLike} from "./Util";

type Store<T> = {[idx:string]:T};

class Scope<T> {
    private stores:{[idx:string]:Store<T>} = Object.create(null);
    private functionScope:boolean;

    constructor(private expression:Expression, private parentExpression:Expression, private parent:Scope<T>) {
        this.functionScope = parent === null || isFunctionLike(parentExpression);
    }

    save(id:Identifier, object:T, blockScoped:boolean):void;
    save(id:Identifier, object:any, blockScoped:boolean, store:string):void;
    save(id:Identifier, object, blockScoped:boolean, store:string = 'default'):void {
        const scope = this.getScope(blockScoped);
        let actualStore = scope.stores[store];
        if (!actualStore) {
            actualStore = scope.stores[store] = Object.create(null);
        }
        actualStore[id.name] = object;
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

    get(id:Identifier):T;
    get(id:Identifier, store:string):any;
    get(id:Identifier, store:string = 'default') {
        if (this.hasInCurrentBlock(id, store)) {
            return this.stores[store][id.name];
        } else if (this.parent) {
            return this.parent.get(id, store);
        } else {
            return null;
        }
    }

    hasInCurrentBlock(id:Identifier, store:string = 'default'):boolean {
        if (!this.stores[store]) {
            return false;
        }
        return Object.prototype.hasOwnProperty.call(this.stores[store], id.name);
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
        if (!id) {
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