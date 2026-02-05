import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAdmin } from './reporte-admin';

describe('ReporteAdmin', () => {
  let component: ReporteAdmin;
  let fixture: ComponentFixture<ReporteAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
