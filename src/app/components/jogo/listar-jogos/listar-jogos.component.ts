import { Component, OnInit, Input } from '@angular/core';
import { Status } from 'src/app/containers/jogo/jogo.status';
import { Router } from '@angular/router';
import { JogoService } from 'src/app/service/jogo.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'listar-jogos',
  templateUrl: './listar-jogos.component.html'
})
export class ListarJogosComponent {
  @Input() jogos: Observable<any>;
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
}
