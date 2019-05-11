import { JogadorService } from './jogador.service';
import { config } from '../collection.config';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { Jogador } from './jogador.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Jogo } from '../jogo/jogo.model';
import { Status } from '../jogo/jogo.status';

@Component({
  selector: 'app-jogador',
  templateUrl: './jogador.component.html',
  styleUrls: ['./jogador.component.css']
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
  constructor(private db: AngularFirestore, private jogadorService: JogadorService, private router: Router, private route: ActivatedRoute) { }

  async comecarJogo() {
    this.jogadorAtual.comecar = !this.jogadorAtual.comecar;
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

  removerJogador(jogador) {
    jogador.removido = true;
    this.jogadorService.updatejogador(jogador.id, jogador, this.jogoId);
  }

  retornarAoJogo() {
    this.jogadorAtual.removido = false;
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual, this.jogoId);
  }


  ngOnInit() {
    this.jogoId = this.route.snapshot.paramMap.get("id")
    this.jogadorService.setJogo(this.jogoId);
    this.jogadorDocId = this.jogadorService.jogadorCriado();
    this.jogadores = this.db.collection(config.jogoDB).doc(this.jogoId).collection(config.jogadorDB).snapshotChanges()
    .pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Jogador;
          const id = a.payload.doc.id;
          
          if (id === this.jogadorDocId) {
            this.jogadorAtual = data;
          }

          return { id, ...data };
        });
      }),
    );

    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    query.snapshotChanges().pipe(
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