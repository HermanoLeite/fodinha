import { Component } from '@angular/core';
import { CartaService } from 'src/app/service/carta.service';

@Component({
  selector: 'visao-carta',
  template: `<label class="switch col-xs-2 col-xs-offset-10">
                <input type="checkbox" [checked]="visaoCarta" (click)="toggleVisaoCarta()">
                <span class="slider round"></span>
              </label>`,
  styleUrls: ['./visao-carta.component.css']
})
export class VisaoCartaComponent {
  visaoCarta: boolean = true;

  constructor(private cartaService: CartaService) {
    this.visaoCarta = this.cartaService.getVisaoCarta();
  }

  async toggleVisaoCarta() {
    this.visaoCarta = await this.cartaService.setVisaoCarta(!this.visaoCarta);
  }
}
