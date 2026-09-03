import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {CountriesService} from "../../services/countries.service";
import {CountryModel} from "../../models/country.model";
import {PageTitleComponent} from "../../components/page-title/page-title.component";
import {CardComponent} from "../../components/card/card.component";
import {ChartComponent} from "../../components/chart/chart.component";

@Component({
  selector: 'app-home',
  standalone: true,
  // Composants utilisés dans le template (auparavant fournis par `AppModule`).
  imports: [PageTitleComponent, CardComponent, ChartComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  protected totalCountries = 0;
  protected totalJOs = 0;
  protected error = '';

  protected countries: string[] = [];
  protected medalsPerCountry: number[] = [];

  constructor(
    private readonly router: Router,
    private readonly countriesService: CountriesService,
  ) {}

  ngOnInit(): void {
    this.countriesService.getCountries().subscribe({
      next: (data: CountryModel[]) => this.handleData(data),
      error: () => (this.error = 'Une erreur est survenue lors du chargement des données.')
    });
  }

  private handleData(data: CountryModel[]): void {
    if (!data || data.length === 0) {
      return;
    }
    this.countries = data.map((c) => c.country);
    this.totalCountries = this.countriesService.getTotalCountries(data);
    this.totalJOs = this.countriesService.getTotalJOs(data);
    this.medalsPerCountry = this.countriesService.getMedalsPerCountry(data);
  }

  protected onCountryClick(countryName: string): void {
    this.router.navigate(['country', countryName]);
  }
}

