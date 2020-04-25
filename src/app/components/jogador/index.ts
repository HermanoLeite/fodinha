import { Component } from '@angular/core'
import { JogadorService } from 'src/app/service/jogador.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Jogador } from '../../models/Jogador'
import { Jogo, Status } from 'src/app/models/Jogo'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { JogadorDocumento } from 'src/app/models/JogadorDocumento'
import { StorageService, Keys } from 'src/app/service/storage.service'
@Component({
  selector: 'jogador',
  templateUrl: './index.html'
})

export class JogadorComponent {
  jogadorDocId: string
  jogoId: string
  jogadorAtual: Jogador
  jogadores: Observable<any>

  constructor(
    private jogadorService: JogadorService,
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService) {

    this.jogoId = this.route.snapshot.paramMap.get("id")
    this.jogadorDocId = this.storage.get(Keys.userId)
  }

  private subscribeJogadorAtual() {
    var jogadorObservable = this.jogadorService.buscarJogador(this.jogoId, this.jogadorDocId)
    jogadorObservable.subscribe(data => this.jogadorAtual = data)
  }

  async criarJogador(jogadorNome: string) {
    if (jogadorNome !== null) {
      this.jogadorDocId = await this.jogadorService.criarJogador(jogadorNome, this.jogoId)
      this.storage.set(Keys.userId, this.jogadorDocId)
      this.subscribeJogadorAtual()
    }
  }

  async comecarJogo() {
    this.jogadorAtual.comecar = !this.jogadorAtual.comecar;
    this.jogadorService.updatejogador(this.jogadorAtual, this.jogoId, this.jogadorDocId);
    const todosJogadoresComecaram = await this.jogadorService.todosJogadoresComecaram(this.jogoId)

    if (todosJogadoresComecaram) {
      this.jogadorService.comecarJogo(this.jogoId)
      this.router.navigate(['jogo', this.jogoId])
    }
  }

  retornarAoJogo() {
    this.jogadorAtual.removido = false;
    this.jogadorService.updatejogador(this.jogadorAtual, this.jogoId, this.jogadorDocId)
  }

  removerJogador(jogadorDocument: JogadorDocumento) {
    this.jogadorService.removerJogador(jogadorDocument, this.jogoId);
  }

  ngOnInit() {
    if (this.jogadorDocId) {
      this.subscribeJogadorAtual()
    }

    this.jogadores = this.jogadorService.buscarJogadores(this.jogoId)
    const jogo = this.jogadorService.buscarJogo(this.jogoId)

    jogo.pipe(
      map(a => {
        const data = a as Jogo

        if (data && data.status === Status.jogando)
          this.router.navigate(['jogo', this.jogoId])
      })
    ).subscribe()
  }
}
