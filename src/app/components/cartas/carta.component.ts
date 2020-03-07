import { Component, Input } from '@angular/core';
import { JogoService } from '../../service/jogo.service';

@Component({
  selector: 'carta',
  template: `<div [ngClass]="{'cartaVermelha': cartaVermelha(naipe)}">
              <span *ngIf="showCartaImg()" class="carta">{{img}}</span>
              <span *ngIf="!showCartaImg()">{{carta}} de {{naipe}}</span>
            <div>`,
  styleUrls: ['./carta.component.css']
})

export class CartaComponent {
  @Input() carta: string;
  @Input() naipe: string;
  @Input() img: string;

  constructor(private jogoService: JogoService) { }
  
  showCartaImg() : boolean {
    return this.jogoService.getVisaoCarta();
  }

  cartaVermelha(naipe: string) : boolean {
    if (naipe === "ouros" || naipe === "copas") return true;
    return false;
  }
}