import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';

import { config } from '../../collection.config';

import { Jogador } from './jogador.model';
import { JogadorService } from '../../service/jogador.service';
import { Jogo } from '../jogo/jogo.model';
import { Status } from '../jogo/jogo.status';

@Component({
  selector: 'jogador',
  templateUrl: './jogador.component.html'
})

export class JogadorComponent implements OnInit {
  jogadores;
  jogadorNome: string;
  jogadorCor: string;
  jogadorDocId = "";
  jogadorAtual: Jogador = {          
    nome: '',
    cor: '',
    comecar: false,
    removido: false,
    jogando: false,
    vidas: 5,
  };
  jogoId: string;
  jogo: Jogo;
  constructor(private db: AngularFirestore, private jogadorService: JogadorService, private router: Router, private route: ActivatedRoute) { 
  }
  
  async comecarJogo() {
    this.jogadorAtual.comecar = !this.jogadorAtual.comecar;
    console.log('começar jogo');
    console.log(JSON.stringify(this.jogadorAtual));
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual, this.jogoId);
    const todosJogadoresComecaram = await this.jogadorService.todosJogadoresComecaram(this.jogoId);
    
    if(todosJogadoresComecaram) {
      this.jogadorService.comecarJogo(this.jogoId);
      this.router.navigate(['jogo', this.jogoId]);
    }
  }

  async saveJogador() {
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

  deleteJogador({id}) {
    this.jogadorService.deletejogador(id, this.jogoId);
  }

  retornarAoJogo() {
    this.jogadorAtual.removido = false;
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual, this.jogoId);
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
    console.log('on init do jogador component');
    jogadorDB.snapshotChanges().pipe(
      map(actions => {
        return actions.map(({ payload }) => {
          const data = payload.doc.data() as Jogador;
          const id = payload.doc.id;
          console.log('jogadorDocId => ', this.jogadorDocId);
          console.log('id => ', id);
          console.log('jogadorAtual => ', JSON.stringify(this.jogadorAtual  ));
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