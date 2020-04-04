import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/containers/jogo/jogo.status';
import { Router } from '@angular/router';
import { JogoService } from 'src/app/service/jogo.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'listar-jogos',
  templateUrl: './listar-jogos.component.html'
})
export class ListarJogosComponent implements OnInit {
  private jogos: Observable<any>;
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
      console.log("navigate jogo id => ", jogo.id)
      this.router.navigate(['jogador', jogo.id]);
    }
  }

  deletarJogo(jogoId) {
    this.jogoService.deletarJogo(jogoId)
  }

  ngOnInit() {
    this.jogos = this.jogoService.jogosStream()
  }
}
