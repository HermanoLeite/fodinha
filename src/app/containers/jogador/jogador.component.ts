import { Component, Input } from '@angular/core';
import { JogadorService } from 'src/app/service/jogador.service';
import { ActivatedRoute } from '@angular/router';
import { Jogador } from '../../models/jogador';
@Component({
  selector: 'jogador',
  templateUrl: './jogador.component.html'
})

export class JogadorComponent {
  jogadorDocId: string
  jogoId: string
  jogadorAtual: Jogador;

  constructor(private jogadorService: JogadorService, private route: ActivatedRoute) {
    this.jogadorDocId = this.jogadorService.jogadorCriado();
    this.jogoId = this.route.snapshot.paramMap.get("id");

    if (this.jogadorDocId) {
      var jogadorObservable = this.jogadorService.buscarJogador(this.jogoId, this.jogadorDocId)
      jogadorObservable.subscribe(data => this.jogadorAtual = data);
    }
  }


  async criarJogador(jogadorNome: string) {
    if (jogadorNome !== null) {
      this.jogadorAtual = await this.jogadorService.criarJogador(jogadorNome, this.jogoId);
    }
  }
}