import { Component, Input } from '@angular/core';
import { JogoService } from '../../service/jogo.service';
import { Carta } from '../../models/carta';

@Component({
  selector: 'carta',
  template: `<div [ngClass]="{'cartaVermelha': cartaVermelha(carta.naipe)}">
              <span *ngIf="showCartaImg()" class="carta">{{carta.img}}</span>
              <span *ngIf="!showCartaImg()">{{carta.carta}} de {{carta.naipe}}</span>
            <div>`,
  styleUrls: ['./carta.component.css']
})

export class CartaComponent {
  @Input() carta: Carta;

  constructor(private jogoService: JogoService) { }

  showCartaImg(): boolean {
    return this.jogoService.getVisaoCarta();
  }

  cartaVermelha(naipe: string): boolean {
    if (naipe === "ouros" || naipe === "copas") return true;
    return false;
  }
}