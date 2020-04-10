import { Injectable } from "@angular/core";
import { LocalStorageService } from './local-storage';

@Injectable()
export class CartaService {
    constructor(private localStorageService: LocalStorageService) {
    }
    getVisaoCarta(): boolean {
        var visaoCarta = this.localStorageService.get("visaoCarta");
        if (visaoCarta === undefined || visaoCarta === null || visaoCarta === "") {
            visaoCarta = "true";
            this.setVisaoCarta(visaoCarta)
        }
        return visaoCarta === "true";
    }

    async setVisaoCarta(visaoCarta) {
        this.localStorageService.set("visaoCarta", visaoCarta);
        return visaoCarta;
    }
}