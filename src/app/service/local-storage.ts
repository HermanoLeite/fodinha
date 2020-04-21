import { Injectable, Inject } from '@angular/core';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';

export class LocalStorageService {

    constructor(@Inject(LOCAL_STORAGE) private storage: WebStorageService) { }

    gameKeys = [Keys.userId]

    set = (key, val): void => this.storage.set(key, val)

    get = (key): string => this.storage.get(key);

    clear = (): void => this.gameKeys.forEach(k => this.delete(k))

    private delete = (key): void => this.storage.remove(key)
}

export enum Keys {
    userId = "userId",
    visaoCarta = "visaoCarta"
}
