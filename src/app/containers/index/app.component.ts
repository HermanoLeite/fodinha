import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<page-header></page-header>
              <div class="container">
                <router-outlet></router-outlet>
              </div>`,
})
export class AppComponent { };
