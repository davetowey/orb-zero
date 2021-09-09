const fs = require('fs');
const  exec  = require("await-exec");

let rawdata = fs.readFileSync('scripts/sydney_tz.json');
let everything = JSON.parse(rawdata);

async function doUpload() {
  for(var i = 0; i < everything.features.length; i++){

  const coordinates = JSON.stringify(everything.features[i].geometry.coordinates);
  const movId = everything.features[i].properties["MOVEMENT_ID"];
  const area = everything.features[i].properties["AREA_SQKM"];
  
  const command = `dfx canister call graphql graphql_mutation '("mutation { createGeometry(input: { geometryType: \\"POLYGON\\" coordinates:\\"${coordinates}\\" movementId: \\"${movId}\\" area:${area} }) { id } }", "{}")'`;
  
  try {
    const { stdout, stderr } = await exec(command); 
  } catch (e) {
    console.error(e);
  }
}

}

doUpload();


