import { Component } from '@angular/core'
import { JogadorService } from 'src/app/service/jogador.service'
import { ActivatedRoute, Router } from '@angular/router'
import { Jogador } from '../../models/jogador'
import { Status } from '../jogo/jogo.status'
import { collections } from 'src/app/context'
import { AngularFirestore } from '@angular/fire/firestore'
import { Jogo } from 'src/app/models/jogo'
import { map } from 'rxjs/operators'
@Component({
  selector: 'jogador',
  templateUrl: './jogador.component.html'
})

export class JogadorComponent {
  jogadorDocId: string
  jogoId: string
  jogadorAtual: Jogador

  constructor(
    private jogadorService: JogadorService,
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private router: Router) {

    this.jogadorDocId = this.jogadorService.jogadorCriado()
    this.jogoId = this.route.snapshot.paramMap.get("id");
    if (this.jogadorDocId) {
      var jogadorObservable = this.jogadorService.buscarJogador(this.jogoId, this.jogadorDocId)
      jogadorObservable.subscribe(data => this.jogadorAtual = data)
    }

  }

  async criarJogador(jogadorNome: string) {
    if (jogadorNome !== null) {
      this.jogadorDocId = await this.jogadorService.criarJogador(jogadorNome, this.jogoId)
    }

    var jogadorObservable = this.jogadorService.buscarJogador(this.jogoId, this.jogadorDocId)
    jogadorObservable.subscribe(data => this.jogadorAtual = data)
  }

  async comecarJogo() {
    this.jogadorAtual.comecar = !this.jogadorAtual.comecar;
    this.jogadorService.updatejogador(this.jogadorAtual, this.jogoId);
    const todosJogadoresComecaram = await this.jogadorService.todosJogadoresComecaram(this.jogoId)

    if (todosJogadoresComecaram) {
      this.jogadorService.comecarJogo(this.jogoId)
      this.router.navigate(['jogo', this.jogoId])
    }
  }

  retornarAoJogo() {
    this.jogadorAtual.removido = false;
    this.jogadorService.updatejogador(this.jogadorAtual, this.jogoId)
  }

  ngOnInit() {
    var jogadorDoc = this.db.collection(collections.jogo).doc(this.jogoId)
    jogadorDoc.valueChanges().pipe(
      map(a => {
        const data = a as Jogo

        if (data && data.status === Status.jogando)
          this.router.navigate(['jogo', this.jogoId])
      })
    ).subscribe()
  }
}