import { Component, Input, OnInit } from '@angular/core';
import { ChatController } from 'src/app/controllers/chat.controller';
import { Observable } from 'rxjs';

@Component({
  selector: 'chat',
  templateUrl: './index.html',
})
export class ChatComponent implements OnInit {
  @Input() jogoId: string
  @Input() nome: string

  chat$: Observable<any>
  novaMensagem: string

  constructor(private chatController: ChatController) { }

  ngOnInit(): void {
    this.chat$ = this.chatController.buscaMensagens(this.jogoId)
  }

  mandaMensagem() {
    this.chatController.mandaMensagem(this.jogoId, this.nome, this.novaMensagem)
  }

  trackByCreated(i, msg) {
    return msg.criadoEm;
  }
}
