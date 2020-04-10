import { Injectable, Inject } from '@angular/core';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';

@Injectable()
export class LocalStorageService {

    constructor(@Inject(LOCAL_STORAGE) private storage: WebStorageService) {

    }

    gameKeys = ["userId"]

    set = (key, val): void => this.storage.set(key, val)

    get = (key): string => this.storage.get(key);

    clear = (): void => this.gameKeys.forEach(k => this.delete(k))

    private delete = (key): void => this.storage.remove(key)
}