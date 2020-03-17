import { Component } from '@angular/core';
import { JogoService } from 'src/app/service/jogo.service';

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

  constructor(private jogoService: JogoService) {
    this.visaoCarta = this.jogoService.getVisaoCarta();
  }

  toggleVisaoCarta() {
    this.visaoCarta = !this.visaoCarta;
    this.jogoService.setVisaoCarta(this.visaoCarta);
  }
}
