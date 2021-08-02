import { gql, sudograph } from "sudograph";

// setup sudograph
const { query, mutation } = sudograph({
  canisterId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
});

async function getGeometry(){
  const result = await query(gql`
    query {
      readGeometry {
        id
        geometryType
        coordinates
      }
    }
  `);
  const feature = result?.data?.readGeometry;
  return feature;
}

async function createGeometry() {
  const result = await mutation(gql`
      mutation ($coordinates: Blob!) {
          createGeometry(input: {
              geometryType: "POINT"
              coordinates: $coordinates
          }) {
            id
            geometryType
            coordinates
          }
      }
  `, {
      coordinates: [0.0,0.0]
  });

  const file = result.data.createGeometry;
  console.log(file);
}


export { getGeometry, createGeometry };
