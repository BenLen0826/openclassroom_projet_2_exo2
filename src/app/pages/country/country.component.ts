import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CountriesService } from '../../services/countries.service';
import { CountryModel } from '../../models/country.model';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { CardComponent } from '../../components/card/card.component';
import { ChartComponent } from '../../components/chart/chart.component';

@Component({
  selector: 'app-country',
  standalone: true,
  // Composants/directives utilisés dans le template (auparavant via `AppModule`).
  imports: [RouterLink, PageTitleComponent, CardComponent, ChartComponent],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly countriesService = inject(CountriesService);

  /** Source unique : le pays affiché. Tout le reste en dérive. */
  private readonly country = signal<CountryModel | undefined>(undefined);

  protected readonly error = signal<string>('');

  protected readonly titlePage = computed<string>(() => this.country()?.country ?? '');
  protected readonly totalEntries = computed<number>(
    () => this.country()?.participations.length ?? 0,
  );
  protected readonly totalMedals = computed<number>(
    () => this.country()?.participations.reduce((sum, p) => sum + p.medalsCount, 0) ?? 0,
  );
  protected readonly totalAthletes = computed<number>(
    () => this.country()?.participations.reduce((sum, p) => sum + p.athleteCount, 0) ?? 0,
  );
  protected readonly years = computed<string[]>(
    () => this.country()?.participations.map((p) => p.year.toString()) ?? [],
  );
  protected readonly medalsPerYear = computed<number[]>(
    () => this.country()?.participations.map((p) => p.medalsCount) ?? [],
  );

  ngOnInit(): void {
    const countryName = this.route.snapshot.paramMap.get('countryName') ?? '';

    this.countriesService.getCountryByName(countryName).subscribe({
      next: (country) => {
        if (!country) {
          this.router.navigate(['not-found']);
          return;
        }
        this.country.set(country);
      },
      error: () => this.error.set('Une erreur est survenue lors du chargement des données.'),
    });
  }
}
