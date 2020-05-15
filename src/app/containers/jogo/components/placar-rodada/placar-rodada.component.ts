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
  @Input() visaoCarta
  public cartas = []

  mostrarCartas = () => this.jogadas && this.jogadas.length > 0 && this.rodada.etapa == Etapa.jogarCarta

  ngOnChanges() {
    if (this.mostrarCartas()) {
      this.jogadas.map(jogada => this.cartas[jogada.jogadorId] = Carta.fromJogada(jogada))
    }
    else {
      this.cartas = []
    }
  }
}
