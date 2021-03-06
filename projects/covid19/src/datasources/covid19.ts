import { RequestOptions, RESTDataSource } from "apollo-datasource-rest";
import DataLoader from "dataloader";
import config from "../config";
import version from "../version";

export class Covid19 extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.covid19api.com/";
  }

  willSendRequest(request: RequestOptions) {
    request.headers.append(
      "User-Agent",
      `${config.serviceName}/${version} (${config.environment})`
    );
  }

  summaryLoader = new DataLoader(
    async (countryCodes: ReadonlyArray<string>) => {
      const countrySummaryByCountryCodes = (
        await this.get<Covid19SummaryResponse>("summary")
      ).Countries.reduce(
        (acc, cur) => ({ ...acc, [cur.CountryCode]: cur }),
        {} as Record<string, Country>
      );

      return countryCodes.map((x) =>
        countrySummaryByCountryCodes[x]
          ? {
              countryCode: countrySummaryByCountryCodes[x].CountryCode,
              totalConfirmed: countrySummaryByCountryCodes[x].TotalConfirmed,
              totalDeath: countrySummaryByCountryCodes[x].TotalDeaths,
            }
          : {}
      );
    }
  );
}

export interface Covid19SummaryResponse {
  ID: string;
  Message: string;
  Global: Global;
  Countries: Country[];
  Date: Date;
}

export interface Country {
  ID: string;
  Country: string;
  CountryCode: string;
  Slug: string;
  NewConfirmed: number;
  TotalConfirmed: number;
  NewDeaths: number;
  TotalDeaths: number;
  NewRecovered: number;
  TotalRecovered: number;
  Date: Date;
}

export interface Global {
  NewConfirmed: number;
  TotalConfirmed: number;
  NewDeaths: number;
  TotalDeaths: number;
  NewRecovered: number;
  TotalRecovered: number;
  Date: Date;
}
