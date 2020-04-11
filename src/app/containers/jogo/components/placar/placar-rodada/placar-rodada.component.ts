import { Component, Input } from '@angular/core';

@Component({
  selector: 'placar-rodada',
  templateUrl: './placar-rodada.component.html',
  styleUrls: ['./placar-rodada.component.css'],
})
export class PlacarRodadaComponent {
  @Input() jogadores;
  @Input() rodada;
  constructor() { }
}
