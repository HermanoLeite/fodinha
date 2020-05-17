import { Component, Input } from '@angular/core';
import { Etapa } from 'src/app/models/jogo.model';


@Component({
  selector: 'placar-jogo',
  templateUrl: './placar-jogo.component.html',
  styleUrls: ['./placar-jogo.component.css'],
})
export class PlacarJogoComponent {
  @Input() jogadores
  @Input() rodada
  status: string

  ngOnChanges() {
    this.status = this.statusJogo()
  }

  statusJogo = () => {
    switch (this.rodada.etapa) {
      case Etapa.palpite: return "Palpite"
      case Etapa.jogarCarta: return "Jogar Carta"
      default: return "Embaralhar"
    }
  }
}
