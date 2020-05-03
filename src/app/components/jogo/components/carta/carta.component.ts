import { Component, Input } from '@angular/core';
import { Carta } from '../../../../models/carta.model';

@Component({
  selector: 'carta',
  template: `<div [ngClass]="{'cartaVermelha': cartaVermelha(carta.naipe)}" *ngIf="carta != null">
              <span *ngIf="visaoCarta" class="carta">{{carta.img}}</span>
              <span *ngIf="!visaoCarta">{{carta.carta}} de {{carta.naipe}}</span>
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
