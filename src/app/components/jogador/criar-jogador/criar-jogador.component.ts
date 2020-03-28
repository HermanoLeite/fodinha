import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Jogador } from 'src/app/containers/jogador/jogador.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { JogadorService } from '../../../service/jogador.service';

import { collections } from '../../../context';

import { map } from 'rxjs/operators';
import { Jogo } from 'src/app/models/jogo';
import { Status } from 'src/app/containers/jogo/jogo.status';

@Component({
  selector: 'criar-jogador',
  templateUrl: './criar-jogador.component.html'
})
export class CriarJogadorComponent implements OnInit {
  jogadorAtual: Jogador;

  jogadorNome: string;
  jogadorCor: string;
  jogadorDocId: string = "";
  jogoId: string;
  jogo: Jogo;
  constructor(
    private db: AngularFirestore,
    private jogadorService: JogadorService,
    private route: ActivatedRoute,
    private router: Router) {
  }

  async comecarJogo() {
    this.jogadorAtual.comecar = !this.jogadorAtual.comecar;
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual, this.jogoId);
    const todosJogadoresComecaram = await this.jogadorService.todosJogadoresComecaram(this.jogoId);

    if (todosJogadoresComecaram) {
      this.jogadorService.comecarJogo(this.jogoId);
      this.router.navigate(['jogo', this.jogoId]);
    }
  }

  retornarAoJogo() {
    this.jogadorAtual.removido = false;
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual, this.jogoId);
  }

  async criarJogador() {
    if (this.jogadorNome !== null) {
      this.jogadorAtual = {
        nome: this.jogadorNome,
        cor: this.jogadorCor,
        comecar: false,
        removido: false,
        jogando: true,
        vidas: 5,
      };
      this.jogadorDocId = await this.jogadorService.addjogador(this.jogadorAtual, this.jogoId);
    }
  }

  buscaIdDoPath(): string {
    return this.route.snapshot.paramMap.get("id");
  }

  ngOnInit() {
    this.jogoId = this.buscaIdDoPath();
    this.jogadorService.setJogo(this.jogoId);
    this.jogadorDocId = this.jogadorService.jogadorCriado();

    var jogoDB = this.db.collection(collections.jogo).doc(this.jogoId);
    var jogadorDB = jogoDB.collection(collections.jogador);

    jogadorDB.snapshotChanges().pipe(
      map(actions => {
        return actions.map(({ payload }) => {
          const data = payload.doc.data() as Jogador;
          const id = payload.doc.id;
          if (id === this.jogadorDocId) {
            this.jogadorAtual = data;
          }
        });
      }),
    ).subscribe();

    jogoDB.snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Jogo;
        const id = a.payload.id;

        if (this.jogadorDocId && data.status === Status.jogando)
          this.router.navigate(['jogo', this.jogoId]);

        return { id, ...data };
      })
    ).subscribe(jogo => this.jogo = jogo);
  }
}
