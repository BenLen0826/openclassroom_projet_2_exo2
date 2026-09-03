import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { CountryModel } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private readonly http = inject(HttpClient);
  private readonly olympicUrl = './assets/mock/olympic.json';

  /** Données chargées une seule fois puis mises en cache pour les vues suivantes. */
  private dataCountries?: CountryModel[];

  getCountries(): Observable<CountryModel[]> {
    if (this.dataCountries) {
      return of(this.dataCountries);
    }

    return this.http
      .get<CountryModel[]>(this.olympicUrl)
      .pipe(tap((countries) => (this.dataCountries = countries)));
  }

  getCountryByName(countryName: string): Observable<CountryModel | undefined> {
    return this.getCountries().pipe(
      map((countries) => countries.find((country) => country.country === countryName)),
    );
  }
}
