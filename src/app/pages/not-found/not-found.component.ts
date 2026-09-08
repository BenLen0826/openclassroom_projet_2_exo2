import { Component } from '@angular/core';
import { BackButtonComponent } from '../../components/back-button/back-button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [BackButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {

}
