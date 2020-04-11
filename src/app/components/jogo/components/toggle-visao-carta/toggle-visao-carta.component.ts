import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CartaService } from 'src/app/service/carta.service';

@Component({
  selector: 'toggle-visao-carta',
  template: `<label class="switch col-xs-2 col-xs-offset-10">
                <input type="checkbox" [checked]="visaoCarta" (click)="toggleVisaoCarta()">
                <span class="slider round"></span>
              </label>`,
  styleUrls: ['./toggle-visao-carta.component.css']
})
export class ToggleVisaoCartaComponent {
  @Input() visaoCarta: boolean = true;
  @Output() setVisaoCarta = new EventEmitter<boolean>()

  async toggleVisaoCarta() {
    this.setVisaoCarta.emit(!this.visaoCarta);
  }
}
