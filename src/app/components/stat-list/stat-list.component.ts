import { Component, input } from '@angular/core';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { StatModel } from '../../models/stat.model';

@Component({
  selector: 'app-stat-list',
  standalone: true,
  imports: [StatCardComponent],
  templateUrl: './stat-list.component.html',
  styleUrl: './stat-list.component.scss',
})
export class StatListComponent {
  /** Liste de statistiques à afficher, une `StatCardComponent` par entrée. */
  readonly stats = input<StatModel[]>([]);
}
