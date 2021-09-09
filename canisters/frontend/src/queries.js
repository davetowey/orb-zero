import { gql, sudograph } from "sudograph";

// setup sudograph
const { query, mutation } = sudograph({
  canisterId: "rrkah-fqaaa-aaaaa-aaaaq-cai",
});

async function getGeometry(){
  const result = await query(gql`
    query {
      readGeometry (search: { area: { lt: 5.0 } } ){
        id
        geometryType
        coordinates
        area
      }
    }
  `);
  const feature = result?.data?.readGeometry;
  return feature;
}

async function createGeometry(coordinates, movementId, travelTime, area ) {
  const result = await mutation(gql`
      mutation ($coordinates: Blob!, movementIt: String!, travelTime: Int, area: float) {
          createGeometry(input: {
              geometryType: "POLYGON"
              coordinates: $coordinates
              movementId: $movementId
              travelTime: $travelTime
              area: $area
          }) {
            id
            geometryType
            coordinates
          }
      }
  `, {
      coordinates: coordinates,
      movementId: movementId,
      travelTime: travelTime,
      area: area
  });

  const file = result.data.createGeometry;
  console.log(file);
}


export { getGeometry, createGeometry };
