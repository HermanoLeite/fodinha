import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/service/local-storage';

@Component({
    selector: 'page-header',
    templateUrl: './page-header.html',
    styleUrls: ['./page-header.css'],
})
export class PageHeaderComponent {
    title = 'fodinha';
    constructor(private localStorageService: LocalStorageService, private router: Router) {
    }

    sairDoJogo() {
        this.localStorageService.clear()
        this.router.navigate(['/'])
    }
}
