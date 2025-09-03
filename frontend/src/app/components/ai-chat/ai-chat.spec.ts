import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { StoryTellerComponent } from './ai-chat';

describe('StoryTellerComponent', () => {
  let component: StoryTellerComponent;
  let fixture: ComponentFixture<StoryTellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryTellerComponent, HttpClientTestingModule],
      providers: [
        provideAnimationsAsync(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoryTellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
