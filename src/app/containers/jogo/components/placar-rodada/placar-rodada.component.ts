import { Component, Input } from '@angular/core';
import { Carta } from 'src/app/models/carta.model';
import { Etapa } from 'src/app/models/jogo.model';

@Component({
  selector: 'placar-rodada',
  templateUrl: './placar-rodada.component.html',
  styleUrls: ['./placar-rodada.component.css'],
})
export class PlacarRodadaComponent {
  @Input() jogadores
  @Input() rodada
  @Input() jogadas
  cartas = []
  status: string

  mostrarCartas = () => this.jogadas && this.jogadas.length > 0 && this.rodada.etapa == Etapa.jogarCarta

  statusJogo = () => {
    if (this.rodada)
      switch (this.rodada.etapa) {
        case Etapa.palpite: return "Palpite"
        case Etapa.jogarCarta: return "Jogar Carta"
        default: return "Embaralhar"
      }
  }

  ngOnChanges() {
    if (this.mostrarCartas()) {
      this.jogadas.map(jogada => this.cartas[jogada.jogadorId] = Carta.fromJogada(jogada))
    }
    else {
      this.cartas = []
    }

    this.status = this.statusJogo()
  }
}
