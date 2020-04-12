import { Injectable } from "@angular/core";
import { LocalStorageService, Keys } from './local-storage';

@Injectable()
export class CartaService {
    constructor(private localStorageService: LocalStorageService) {
    }

    getVisaoCarta(): boolean {
        var visaoCarta = this.localStorageService.get(Keys.visaoCarta);
        console.log('getVisaoCarta => ', visaoCarta)
        if (visaoCarta === undefined || visaoCarta === null || visaoCarta === "") {
            visaoCarta = "true";
            this.setVisaoCarta(visaoCarta)
        }
        return visaoCarta.toString() === "true";
    }

    async setVisaoCarta(visaoCarta) {
        this.localStorageService.set(Keys.visaoCarta, visaoCarta);
        return visaoCarta;
    }
}
