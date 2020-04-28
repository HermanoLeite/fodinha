import { Component } from '@angular/core';
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { Status, Jogo } from '../../models/Jogo'
import { JogoController } from '../../controllers/jogo.controller'
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-jogo-init',
  templateUrl: './index.html',
})
export class JogoInitComponent {
  jogos: Observable<Jogo[]>

  constructor(
    private storageService: StorageService,
    private router: Router,
    private jogoService: JogoController) {
    this.storageService.clear()
  }

  entrarJogo(jogo) {
    if (jogo.status === Status.finalizado) {
      this.router.navigate(['jogo', jogo.id])
    }
    else {
      this.router.navigate(['jogador', jogo.id])
    }
  }

  removerJogo(jogoId) {
    this.jogoService.deletarJogo(jogoId)
  }

  criarJogo(jogoNome: string) {
    if (jogoNome !== null) {
      this.jogoService.novoJogo(jogoNome)
    }
  }

  ngOnInit() {
    this.jogos = this.jogoService.jogosStream()
  }
}
