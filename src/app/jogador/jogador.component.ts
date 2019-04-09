import { JogadorService } from './jogador.service';
import { config } from './collection.config';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import {Router} from '@angular/router';
import { Jogador } from './jogador.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-jogador',
  templateUrl: './jogador.component.html',
  styleUrls: ['./jogador.component.css']
})
export class JogadorComponent implements OnInit {
  jogadores;
  jogadorNome: string;
  jogadorCor: string;
  editMode: boolean = false;
  jogadorDocId = "";
  jogadorAtual: Jogador = {          
    nome: '',
    cor: '',
    comecar: false,
    vida: 5,
    removido: false,
    jogoId: "",
  };
  removido: boolean = false;
  jogoId: string;
  constructor(private db: AngularFirestore, private jogadorService: JogadorService, private router: Router) { }

  async comecarJogo() {
    this.jogadorAtual.comecar = !this.jogadorAtual.comecar;
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual);
    const todosJogadoresComecaram = await this.jogadorService.todosJogadoresComecaram();
    
    if(todosJogadoresComecaram) {
      const jogoId = await this.jogadorService.comecarJogo();
      this.jogadorAtual.jogoId = jogoId;
      this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual);
      this.router.navigate(['jogo']);
    }
  }

  async saveJogador() {
    if (this.jogadorNome !== null) {
      this.jogadorAtual = {
          nome: this.jogadorNome,
          cor: this.jogadorCor,
          comecar: false,
          vida: 5,
          removido: false,
          jogoId: ""
      };
      this.jogadorDocId = await this.jogadorService.addjogador(this.jogadorAtual);
    }
  }

  deleteJogador({id}) {
    this.jogadorService.deletejogador(id);
  }

  removerJogador(jogador) {
    jogador.removido = true;
    this.jogadorService.updatejogador(jogador.id, jogador);
  }

  retornarAoJogo() {
    this.jogadorAtual.removido = false;
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual);
  }


  ngOnInit() {
    this.jogadorDocId = this.jogadorService.jogadorCriado();
    this.jogadores = this.db.collection(config.jogadorDB).snapshotChanges()
    .pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Jogador;
          if (data.jogoId !== "")
            this.jogoId = data.jogoId;
          
          const id = a.payload.doc.id;
          if (id === this.jogadorDocId) {
            this.jogadorAtual = data;
          }

          if(this.jogoId && this.jogadorAtual && this.jogadorAtual.comecar && this.jogadorAtual.jogoId==="") {
            this.jogadorAtual.jogoId = this.jogoId;
            this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual);
            this.router.navigate(['jogo']);
          }
          return { id, ...data };
        });
      }),
    );
    
  }
}