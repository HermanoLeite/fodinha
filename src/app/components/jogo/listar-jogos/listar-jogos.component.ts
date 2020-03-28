import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/containers/jogo/jogo.status';
import { Router } from '@angular/router';
import { JogoService } from 'src/app/service/jogo.service';

@Component({
  selector: 'listar-jogos',
  templateUrl: './listar-jogos.component.html'
})
export class ListarJogosComponent implements OnInit {
  jogos;
  constructor(
    private router: Router,
    private jogoService: JogoService) {
  }

  getStatus(status: Status) {
    switch (status) {
      case Status.aguardandoJogadores: return "Aguardando Jogadores"
      case Status.jogando: return "Jogando"
      case Status.finalizado: return "Finalizado"
    }
  }

  entrarJogo(jogo) {
    if (jogo.status === Status.finalizado) {
      this.router.navigate(['jogo', jogo.id]);
    }
    else {
      this.router.navigate(['jogador', jogo.id]);
    }
  }

  deletarJogo(jogoId) {
    this.jogoService.deletarJogo(jogoId)
  }

  ngOnInit() {
    this.jogos = this.jogoService.listarJogos()
  }
}
