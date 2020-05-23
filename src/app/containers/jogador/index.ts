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
  styleUrls: ['./index.css', '../style.css']
})

export class JogadorComponent implements OnInit {
  jogadorDocId: string
  jogoId: string
  jogadorAtual: Jogador
  jogadores: Observable<JogadorDocumento[]>
  jogoNaoEncontrado: boolean = false;

  constructor(
    private jogadorController: JogadorController,
    private route: ActivatedRoute,
    private router: Router,
    private storage: StorageService) {

    this.jogoId = this.route.snapshot.paramMap.get("id")
    this.jogadorDocId = this.storage.get(Keys.userId)
  }

  private subscribeJogadorAtual() {
    var jogadorObservable = this.jogadorController.buscarJogador(this.jogoId, this.jogadorDocId)
    jogadorObservable.subscribe(data => this.jogadorAtual = data)
  }

  async criarJogador(jogadorNome: string) {
    if (jogadorNome !== null) {
      this.jogadorDocId = await this.jogadorController.criarJogador(jogadorNome, this.jogoId)
      this.storage.set(Keys.userId, this.jogadorDocId)
      this.subscribeJogadorAtual()
    }
  }

  async comecarJogo() {
    this.jogadorAtual.comecar = !this.jogadorAtual.comecar;
    this.jogadorController.updatejogador(this.jogadorAtual, this.jogoId, this.jogadorDocId);
    const todosJogadoresComecaram = await this.jogadorController.todosJogadoresComecaram(this.jogoId)

    if (todosJogadoresComecaram) {
      this.jogadorController.comecarJogo(this.jogoId)
      this.router.navigate(['jogo', this.jogoId])
    }
  }

  retornarAoJogo() {
    this.jogadorAtual.removido = false;
    this.jogadorController.updatejogador(this.jogadorAtual, this.jogoId, this.jogadorDocId)
  }

  removerJogador(jogadorDocument: JogadorDocumento) {
    this.jogadorController.removerJogador(jogadorDocument, this.jogoId);
  }

  ngOnInit() {
    if (this.jogadorDocId) {
      this.subscribeJogadorAtual()
    }

    this.jogadores = this.jogadorController.jogadoresStream(this.jogoId)
    var jogo$ = this.jogadorController.jogoStream(this.jogoId).pipe(
      map((jogo: Jogo) => {
        if (!jogo) {
          this.jogoNaoEncontrado = true
        }

        if (jogo && jogo.status === Status.jogando) {
          this.router.navigate(['jogo', this.jogoId])
        }
      })
    )
    jogo$.subscribe();
  }
}
