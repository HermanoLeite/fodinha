import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Jogador } from 'src/app/containers/jogador/jogador.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { JogadorService } from 'src/app/service/jogador.service';

import { config } from '../../../collection.config';

import { map } from 'rxjs/operators';
import { Jogo } from 'src/app/containers/jogo/jogo.model';
import { Status } from 'src/app/containers/jogo/jogo.status';

@Component({
  selector: 'criar-jogador',
  templateUrl: './criar-jogador.component.html'
})
export class CriarJogadorComponent implements OnInit  {
  jogadorAtual : Jogador;

  jogadorNome : string;
  jogadorCor : string;
  jogadorDocId : string = "";
  jogoId : string;
  constructor( 
    private db: AngularFirestore, 
    private jogadorService: JogadorService, 
    private route: ActivatedRoute, 
    private router: Router) { 
  }

  async comecarJogo() {
    this.jogadorAtual.comecar = !this.jogadorAtual.comecar;
    console.log("começar jogador => ", JSON.stringify(this.jogadorAtual))
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual, this.jogoId);
    const todosJogadoresComecaram = await this.jogadorService.todosJogadoresComecaram(this.jogoId);
    
    if(todosJogadoresComecaram) {
      this.jogadorService.comecarJogo(this.jogoId);
      this.router.navigate(['jogo', this.jogoId]);
    }
  }

  retornarAoJogo() {
    this.jogadorAtual.removido = false;
    console.log("jogadorAtual => ", JSON.stringify(this.jogoId))
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual, this.jogoId);
  }

  async criarJogador() {
    console.log("jogoId =>", this.jogoId)
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

  buscaIdDoPath() : string  {
    return this.route.snapshot.paramMap.get("id");
  }

  ngOnInit() {
    this.jogoId = this.buscaIdDoPath();
    this.jogadorService.setJogo(this.jogoId);
    this.jogadorDocId = this.jogadorService.jogadorCriado();

    var jogoDB = this.db.collection(config.jogoDB).doc(this.jogoId);
    var jogadorDB = jogoDB.collection(config.jogadorDB);
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
  }
}
