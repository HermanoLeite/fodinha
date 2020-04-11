import { Component } from '@angular/core';
import { LocalStorageService } from 'src/app/service/local-storage';
import { Router } from '@angular/router';
import { JogoService } from 'src/app/service/jogo.service';
import { Observable } from 'rxjs';
import { Status } from '../jogo/jogo.status';

@Component({
  selector: 'app-jogo-init',
  templateUrl: './jogo-init.component.html',
})
export class JogoInitComponent {
  jogos: Observable<any>;

  constructor(
    private localStorageService: LocalStorageService,
    private router: Router,
    private jogoService: JogoService) {
    this.localStorageService.clear()
  }

  entrarJogo(jogo) {
    if (jogo.status === Status.finalizado) {
      this.router.navigate(['jogo', jogo.id]);
    }
    else {
      this.router.navigate(['jogador', jogo.id]);
    }
  }

  removerJogo(jogoId) {
    this.jogoService.deletarJogo(jogoId)
  }

  salvarJogo(jogoNome: string) {
    if (jogoNome !== null) {
      this.jogoService.novoJogo(jogoNome);
    }
  }

  ngOnInit() {
    this.jogos = this.jogoService.jogosStream()
  }
}
