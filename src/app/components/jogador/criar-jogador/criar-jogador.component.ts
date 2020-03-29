import { Component, Input } from '@angular/core';
import { Jogador } from 'src/app/containers/jogador/jogador.model';
import { JogadorService } from '../../../service/jogador.service';

@Component({
  selector: 'criar-jogador',
  templateUrl: './criar-jogador.component.html'
})
export class CriarJogadorComponent {
  @Input() jogadorDocId: string;
  @Input() jogoId: string;

  jogadorAtual: Jogador;
  jogadorNome: string;

  constructor(private jogadorService: JogadorService) { }

  async criarJogador() {
    if (this.jogadorNome !== null) {
      this.jogadorDocId = await this.jogadorService.criarJogador(this.jogadorNome, this.jogoId);
    }
  }
}
