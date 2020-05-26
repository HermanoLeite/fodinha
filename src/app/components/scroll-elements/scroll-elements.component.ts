import { Component, Input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core'
import { Observable } from 'rxjs';

@Component({
    selector: 'scroll-elements',
    templateUrl: './scroll-elements.component.html',
    styleUrls: ['./scroll-elements.component.css']
})
export class ScrollElementsComponent implements AfterViewChecked {
    @Input() events: Observable<any>
    @Input() title: string

    @ViewChild('scroll') private scroll: ElementRef;

    ngAfterViewChecked() {
        console.log('title => ', this.title)
        console.log('this.events => ', this.events)
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
        } catch (err) { }
    }

    trackByCreated = (i, msg) => msg.criadoEm
}
