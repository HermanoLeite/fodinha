import { Injectable } from "@angular/core";
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class CartaService {
    constructor(private cookieService: CookieService) {
    }
    getVisaoCarta(): boolean {
        var visaoCarta = this.cookieService.get("visaoCarta");
        if (visaoCarta === undefined || visaoCarta === null || visaoCarta === "") {
            visaoCarta = "true";
            this.setVisaoCarta(visaoCarta)
        }
        return visaoCarta === "true";
    }

    async setVisaoCarta(visaoCarta) {
        this.cookieService.set("visaoCarta", visaoCarta);
        return visaoCarta;
    }
}