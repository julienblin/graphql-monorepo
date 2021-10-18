import { gql } from "apollo-server-core";
import { server } from "../src/server";

describe("Fetch countries", () => {
  it("should be ok", async () => {
    const result = await server.executeOperation({
      query: gql`
        query GetCountries {
          countries: {
            countryCode
            name
          }
        }`,
    });

    console.log(result);

    expect(true).toBeTruthy();
  });
});