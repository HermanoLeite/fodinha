import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatController } from 'src/app/controllers/chat.controller';
import { Observable } from 'rxjs';

@Component({
  selector: 'chat',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @Input() jogoId: string
  @Input() nome: string
  container: HTMLElement;

  chat$: Observable<any>
  novaMensagem: string

  @ViewChild('scroll') private scroll: ElementRef;

  constructor(private chatController: ChatController) { }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
    } catch (err) { }
  }

  ngOnInit(): void {
    this.chat$ = this.chatController.buscaMensagens(this.jogoId)
  }

  mandaMensagem() {
    this.chatController.mandaMensagem(this.jogoId, this.nome, this.novaMensagem)
    this.novaMensagem = ""
  }

  trackByCreated(i, msg) {
    return msg.criadoEm;
  }
}
