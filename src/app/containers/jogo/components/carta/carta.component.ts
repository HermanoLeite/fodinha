import { Component, Input } from '@angular/core';
import { Carta } from '../../../../models/carta.model';

@Component({
  selector: 'carta',
  template: `<div class="deck-card" *ngIf="carta != null">
              <img src="https://deckofcardsapi.com/static/img/{{carta.url}}.png" />
            <div>`,
  styleUrls: ['./carta.component.css']
})

export class CartaComponent {
  @Input() carta: Carta
  @Input() visaoCarta: Boolean

  cartaVermelha(naipe: string): boolean {
    if (naipe === "ouros" || naipe === "copas") return true
    return false
  }
}
