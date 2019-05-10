import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JogoInitComponent } from './jogo-init.component';

describe('JogoInitComponent', () => {
  let component: JogoInitComponent;
  let fixture: ComponentFixture<JogoInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JogoInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JogoInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
