import { Injectable } from "@angular/core";
import { StorageService, Keys } from './storage.service';

@Injectable()
export class CartaService {
    constructor(private storageService: StorageService) {
    }

    getVisaoCarta(): boolean {
        var visaoCarta = this.storageService.get(Keys.visaoCarta);
        if (visaoCarta === undefined || visaoCarta === null || visaoCarta === "") {
            visaoCarta = "true";
            this.setVisaoCarta(visaoCarta)
        }
        return visaoCarta.toString() === "true";
    }

    async setVisaoCarta(visaoCarta) {
        this.storageService.set(Keys.visaoCarta, visaoCarta);
        return visaoCarta;
    }
}
