import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CountryModel } from '../../models/country.model';
import { ParticipationModel } from '../../models/participation.model';
import { PageTitleComponent } from '../../components/page-title/page-title.component';
import { CardComponent } from '../../components/card/card.component';
import { ChartComponent } from '../../components/chart/chart.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PageTitleComponent, CardComponent, ChartComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);

  /** Source unique : la liste brute des pays. Tout le reste en dérive. */
  private readonly countries = signal<CountryModel[]>([]);

  protected readonly error = signal<string>('');

  protected readonly countryNames = computed<string[]>(() =>
    this.countries().map((c: CountryModel) => c.country),
  );
  protected readonly totalCountries = computed<number>(() => this.countries().length);
  protected readonly totalJOs = computed<number>(
    () =>
      new Set(
        this.countries().flatMap((c: CountryModel) =>
          c.participations.map((p: ParticipationModel) => p.year),
        ),
      ).size,
  );
  protected readonly medalsPerCountry = computed<number[]>(() =>
    this.countries().map((c: CountryModel) =>
      c.participations.reduce((sum: number, p: ParticipationModel) => sum + p.medalsCount, 0),
    ),
  );

  ngOnInit(): void {
    this.dataService
      .getCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (countries: CountryModel[]) => this.countries.set(countries),
        error: () => this.error.set('Une erreur est survenue lors du chargement des données.'),
      });
  }

  protected onCountryClick(countryName: string): void {
    this.router.navigate(['country', countryName]);
  }
}
