import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { DataService } from '../../services/data.service';
import { CountryModel } from '../../models/country.model';
import { ParticipationModel } from '../../models/participation.model';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ChartComponent } from '../../components/chart/chart.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, PageHeaderComponent, ChartComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);

  protected readonly countries$ = this.dataService.getCountries().pipe(
    map((countries: CountryModel[]) => ({
      countryNames: countries.map((c: CountryModel) => c.country),
      medalsPerCountry: countries.map((c: CountryModel) =>
        c.participations.reduce((sum: number, p: ParticipationModel) => sum + p.medalsCount, 0),
      ),
      stats: [
        {
          label: 'Number of JOs',
          value: new Set(countries.flatMap((c) => c.participations.map((p) => p.year))).size,
        },
        { label: 'Number of countries', value: countries.length },
      ],
    })),
  );

  protected onCountryClick(countryName: string): void {
    this.router.navigate(['country', countryName]);
  }
}
