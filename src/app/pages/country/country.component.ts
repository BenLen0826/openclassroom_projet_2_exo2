import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CountryModel } from '../../models/country.model';
import { ParticipationModel } from '../../models/participation.model';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ChartComponent } from '../../components/chart/chart.component';
import { BackButtonComponent } from '../../components/back-button/back-button.component';

@Component({
  selector: 'app-country',
  standalone: true,
  // Composants/directives utilisés dans le template (auparavant via `AppModule`).
  imports: [AsyncPipe, PageHeaderComponent, ChartComponent, BackButtonComponent],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);

  protected readonly country$ = this.dataService.getCountries().pipe(
    map((countries: CountryModel[]) => {
      const countryName = this.route.snapshot.paramMap.get('countryName');
      const country = countries.find((c: CountryModel) => c.country === countryName);

      if (!country) {
        this.router.navigate(['not-found']);
        return null;
      }

      return {
        titlePage: country.country,
        years: country.participations.map((p: ParticipationModel) => p.year.toString()),
        medalsPerYear: country.participations.map((p: ParticipationModel) => p.medalsCount),
        stats: [
          { label: 'Number of entries', value: country.participations.length },
          {
            label: 'Total number of medals',
            value: country.participations.reduce(
              (sum: number, p: ParticipationModel) => sum + p.medalsCount,
              0,
            ),
          },
          {
            label: 'Total number of athletes',
            value: country.participations.reduce(
              (sum: number, p: ParticipationModel) => sum + p.athleteCount,
              0,
            ),
          },
        ],
      };
    }),
  );
}
