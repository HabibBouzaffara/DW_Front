import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthProductListComponent } from './auth-product-list.component';

describe('AuthProductListComponent', () => {
  let component: AuthProductListComponent;
  let fixture: ComponentFixture<AuthProductListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuthProductListComponent]
    });
    fixture = TestBed.createComponent(AuthProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
