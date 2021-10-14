import { GraphQLResolverMap } from "apollo-graphql";
import { DataSources } from "./datasources";

export const resolvers: GraphQLResolverMap<{ dataSources: DataSources }> = {
  Country: {
    async __resolveReference(country, { dataSources }) {
      return dataSources.countriesNow.populationLoader.load(
        country.countryCode
      );
    },
  },
};