import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {CountryModel} from "../models/country.model";
import {map, Observable, of, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private readonly olympicUrl = './assets/mock/olympic.json';
  private dataCountries: CountryModel[] = [];

  constructor(private readonly http: HttpClient) { }


  getCountries(): Observable<CountryModel[]> {
    if (this.dataCountries.length > 0) {
      return of(this.dataCountries);
    }

    return this.http.get<CountryModel[]>(this.olympicUrl).pipe(
      tap((data) => (this.dataCountries = data))
    );
  }

  getCountryByName(countryName: string): Observable<CountryModel | undefined> {
    return this.getCountries().pipe(
      map((countries) => countries.find((c) => c.country === countryName))
    );
  }

  getTotalCountries(countries: CountryModel[]): number {
    return countries.length;
  }

  getTotalJOs(countries: CountryModel[]): number {
    return new Set(
      countries.flatMap((c) => c.participations.map((p) => p.year))
    ).size;
  }

  getTotalMedalsForCountry(country: CountryModel): number {
    return country.participations.reduce((sum, p) => sum + p.medalsCount, 0);
  }

  getTotalAthletesForCountry(country: CountryModel): number {
    return country.participations.reduce((sum, p) => sum + p.athleteCount, 0);
  }

  getMedalsPerCountry(countries: CountryModel[]): number[] {
    return countries.map((c) => this.getTotalMedalsForCountry(c));
  }

}
