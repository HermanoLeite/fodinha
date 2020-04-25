import { Component } from '@angular/core';
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { Status, Jogo } from 'src/app/models/Jogo'
import { JogoService } from 'src/app/service/jogo.service'
import { StorageService } from 'src/app/service/storage.service';

@Component({
  selector: 'app-jogo-init',
  templateUrl: './index.html',
})
export class JogoInitComponent {
  jogos: Observable<Jogo[]>

  constructor(
    private storageService: StorageService,
    private router: Router,
    private jogoService: JogoService) {
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

  salvarJogo(jogoNome: string) {
    if (jogoNome !== null) {
      this.jogoService.novoJogo(jogoNome)
    }
  }

  ngOnInit() {
    this.jogos = this.jogoService.jogosStream()
  }
}
