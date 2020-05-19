import { Component, OnInit } from '@angular/core'
import { JogadorController } from 'src/app/controllers/jogador.controller'
import { ActivatedRoute, Router } from '@angular/router'
import { Jogador } from '../../models/jogador.model'
import { Jogo, Status } from 'src/app/models/jogo.model'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { JogadorDocumento } from 'src/app/models/jogadorDocumento.model'
import { StorageService, Keys } from 'src/app/services/storage.service'
@Component({
  selector: 'jogador',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})

export class JogadorComponent implements OnInit {
  jogadorDocId: string
  jogoId: string
  jogadorAtual: Jogador
  jogadores: Observable<JogadorDocumento[]>

  constructor(
    private jogadorService: JogadorController,
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

    this.jogadores = this.jogadorService.jogadoresStream(this.jogoId)
    this.jogadorService.jogoStream(this.jogoId).pipe(
      map((jogo: Jogo) => {
        if (jogo && jogo.status === Status.jogando)
          this.router.navigate(['jogo', this.jogoId])
      })
    ).subscribe()
  }
}
