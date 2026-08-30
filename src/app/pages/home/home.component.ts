import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {CountriesService} from "../../services/countries.service";
import {CountryModel} from "../../models/country.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  /*
  // private olympicUrl = './assets/mock/olympic.json';
  public pieChart!: Chart<"pie", number[], string>;
  public totalCountries: number = 0
  public totalJOs: number = 0
  public error!:string
  titlePage: string = "Medals per Country";

  constructor(private router: Router, private http:HttpClient) { }

  ngOnInit() {
    this.http.get<any[]>(this.olympicUrl).pipe().subscribe(
      (data) => {
        console.log(`Liste des données : ${JSON.stringify(data)}`);
        if (data && data.length > 0) {
          this.totalJOs = Array.from(new Set(data.map((i: any) => i.participations.map((f: any) => f.year)).flat())).length;
          const countries: string[] = data.map((i: any) => i.country);
          this.totalCountries = countries.length;
          const medals = data.map((i: any) => i.participations.map((i: any) => (i.medalsCount)));
          const sumOfAllMedalsYears = medals.map((i) => i.reduce((acc: any, i: any) => acc + i, 0));
          this.buildPieChart(countries, sumOfAllMedalsYears);
        }
      },
      (error:HttpErrorResponse) => {
        console.log(`erreur : ${error}`);
        this.error = error.message
      }
    )
  }

  buildPieChart(countries: string[], sumOfAllMedalsYears: number[]) {
    const pieChart = new Chart("DashboardPieChart", {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [{
          label: 'Medals',
          data: sumOfAllMedalsYears,
          backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
          hoverOffset: 4
        }],
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => {
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(e.native, 'point', { intersect: true }, true)
            if (points.length) {
              const firstPoint = points[0];
              const countryName = pieChart.data.labels ? pieChart.data.labels[firstPoint.index] : '';
              this.router.navigate(['country', countryName]);
            }
          }
        }
      }
    });
    this.pieChart = pieChart;
  }*/

  public totalCountries = 0;
  public totalJOs = 0;
  public error = '';

  public countries: string[] = [];
  public medalsPerCountry: number[] = [];

  constructor(private router: Router, private countriesService: CountriesService) {}

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

  onCountryClick(countryName: string): void {
    this.router.navigate(['country', countryName]);
  }
}

