import { Component } from '@angular/core'
import { JogadorService } from 'src/app/service/jogador.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Jogador } from '../../models/Jogador'
import { Status } from '../jogo/jogo.status'
import { collections } from 'src/app/context'
import { AngularFirestore } from '@angular/fire/firestore'
import { Jogo } from 'src/app/models/Jogo'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { JogadorDocumento } from 'src/app/models/JogadorDocumento'
import { LocalStorageService, Keys } from 'src/app/service/local-storage'
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
    private db: AngularFirestore,
    private router: Router,
    private localStorage: LocalStorageService) {

    this.jogadorDocId = this.localStorage.get(Keys.userId)

    this.jogoId = this.route.snapshot.paramMap.get("id");
    if (this.jogadorDocId) {
      var jogadorObservable = this.jogadorService.buscarJogador(this.jogoId, this.jogadorDocId)
      jogadorObservable.subscribe(data => this.jogadorAtual = data)
    }
  }

  async criarJogador(jogadorNome: string) {
    if (jogadorNome !== null) {
      const jogadorDocId = await this.jogadorService.criarJogador(jogadorNome, this.jogoId)

      this.localStorage.set(Keys.userId, jogadorDocId)
      this.jogadorDocId = jogadorDocId
    }

    var jogadorObservable = this.jogadorService.buscarJogador(this.jogoId, this.jogadorDocId)
    jogadorObservable.subscribe(data => this.jogadorAtual = data)
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
    var jogoDB = this.db.collection(collections.jogo).doc(this.jogoId);
    var jogadorDB = jogoDB.collection(collections.jogador);

    this.jogadores = jogadorDB.snapshotChanges().pipe(
      map(actions => {
        return actions.map(({ payload }) => {
          const data = payload.doc.data() as Jogador;
          const id = payload.doc.id;

          return new JogadorDocumento(id, data);
        });
      }),
    )

    jogoDB.valueChanges().pipe(
      map(a => {
        const data = a as Jogo

        if (data && data.status === Status.jogando)
          this.router.navigate(['jogo', this.jogoId])
      })
    ).subscribe()
  }
}
