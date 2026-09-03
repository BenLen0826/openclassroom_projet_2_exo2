import { Component, input } from '@angular/core';
import { StatListComponent } from '../stat-list/stat-list.component';
import { StatModel } from '../../models/stat.model';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [StatListComponent],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly title = input<string>('');

  readonly stats = input<StatModel[]>([]);
}
