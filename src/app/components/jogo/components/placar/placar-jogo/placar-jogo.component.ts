import { Component, Input } from '@angular/core';

@Component({
  selector: 'placar-jogo',
  templateUrl: './placar-jogo.component.html'
})
export class PlacarJogoComponent {
  @Input() jogadoresJogo;
  constructor() { }
}
