import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { FeedsComponent } from '../../layout/feeds/feeds.component';

@Component({
  selector: 'app-main',
  imports: [FooterComponent, FeedsComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent {

}
