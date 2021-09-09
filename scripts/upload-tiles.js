const fs = require('fs');
const  exec  = require("await-exec");

async function uploadTile(path) {

  var data = fs.readFileSync(`./scripts/tiles/${path}`, 'hex');

  var str = data.toString().toUpperCase();
  var parts = str.match(/.{1,2}/g);
  var new_value = "\\" + parts.join("\\"); 
  
  const command = `dfx canister call orb-tileserver store '("${path}", blob "${new_value}")'`;
  try {
    const { stdout, stderr } = await exec(command); 
  } catch (e) {
    console.error(e);
  }

}

async function doUpload() {

  const filenames = [];

  let zLevel = fs.readdirSync("./scripts/tiles/", { withFileTypes: true }).filter(dirent => dirent.isDirectory());

   zLevel.forEach( z => {

   let xlevel = fs.readdirSync(`./scripts/tiles/${z.name}/`, { withFileTypes: true }).filter(dirent => dirent.isDirectory());
   xlevel.forEach( x => {
    let ylevel = fs.readdirSync(`./scripts/tiles/${z.name}/${x.name}`, { withFileTypes: true });
    ylevel.forEach( y => {
      filenames.push(`${z.name}/${x.name}/${y.name}`);
    })

   } );

 });

 for(var i = 0; i < filenames.length; i++){
   await uploadTile(filenames[i]);
 }

}

doUpload();

