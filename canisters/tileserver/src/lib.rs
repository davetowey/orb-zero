use ic_cdk::{storage, export::Principal};
use ic_cdk_macros::*;
use std::collections::{BTreeMap, BTreeSet};
use std::path::Path;

use ic_cdk::export::candid::{
  candid_method, export_service, CandidType, Deserialize,
};

type Store = BTreeMap<String, Vec<u8>>;

#[ic_cdk_macros::update]
#[candid_method(update)]
fn store(path: String, contents: Vec<u8>) {
    let store = storage::get_mut::<Store>();
    store.insert(path, contents);
}

fn retrieve(path: &str) -> Option<&'static [u8]>{
    let store = storage::get::<Store>();

    match store.get(path) {
        Some(content) => Some(content) ,
        None => None,
    }
}

#[derive(CandidType, Deserialize)]
pub struct HeaderField(pub String, pub String);

#[derive(CandidType, Deserialize)]
pub struct HttpRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<HeaderField>,
    #[serde(with = "serde_bytes")]
    pub body: Vec<u8>,
}

#[derive(CandidType, Deserialize)]
pub struct HttpResponse {
    pub status_code: u16,
    pub headers: Vec<HeaderField>,
    #[serde(with = "serde_bytes")]
    pub body: Vec<u8>,
}

//fn retrieve(path: &str) -> Option<&'static [u8]> {
    // let tiles = include_dir!("canisters/tileserver/src/tiles");
    // let tilepath = Path::new(path);
    // return tiles.get(tilepath).map(|x| *x);
    // let store = storage::get::<Store>();

    // match store.get(&path) {
    //     Some(content),
    //     None,
    // }
//}

fn get_path(url: &str) -> Option<&str> {
    url.split('?').next()
}

#[ic_cdk_macros::query]
#[candid_method(query)]
fn http_request(request: HttpRequest) -> HttpResponse {

    let path: Vec<&str> = request.url.as_str().split('?').collect();
    // let xyz: Vec<&str> = path[0].split('/').collect();

    // let zoom = xyz[3].parse().unwrap();
    // let x = xyz[1].parse().unwrap();
    // let y = xyz[2].parse().unwrap();



    // let grid = Grid::web_mercator();
    // let bbox = grid.tile_extent(zoom, x, y);
    // let string: &str = &*(bbox.minx.to_string());
    // let bytes = string.as_bytes();
    
    //let path = get_path(request.url.as_str()).unwrap_or("/");
    if let Some(bytes) = retrieve(&path[0][1..]) {
      HttpResponse {
        status_code: 200,
        headers: vec![
            // HeaderField("Content-Encoding".to_string(), "gzip".to_string()),
            HeaderField("Access-Control-Allow-Origin".to_string(), "*".to_string()),
            HeaderField("Content-Length".to_string(), format!("{}", bytes.len())),
            HeaderField("Cache-Control".to_string(), format!("max-age={}", 600)),
        ],
        body: bytes.to_vec(),
      }
    } else {
      HttpResponse {
        status_code: 404,
        headers: Vec::new(),
        body: path[0].as_bytes().to_vec(),
      }
    }
}

export_service!();

#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}