import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatController } from 'src/app/controllers/chat.controller';
import { Observable } from 'rxjs';

@Component({
  selector: 'chat',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class ChatComponent implements OnInit {
  @Input() jogoId: string
  @Input() nome: string
  container: HTMLElement;

  chat$: Observable<any>
  novaMensagem: string

  constructor(private chatController: ChatController) { }

  mandaMensagem() {
    if (this.nome) {
      this.chatController.mandaMensagem(this.jogoId, this.nome, this.novaMensagem)
    }
    this.novaMensagem = ""
  }

  ngOnInit(): void {
    this.chat$ = this.chatController.buscaMensagens(this.jogoId)
  }
}
