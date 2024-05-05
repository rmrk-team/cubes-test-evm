export const BASE_URI =
  'https://rmrk.myfilebase.com/ipfs/QmUEEhZy4WZiqAukZEDrgz27sDZPv8wBDPJYys5ZExqEGx';

export const CATALOG_METADATA = `${BASE_URI}/catalog/metadata.json`;
export const CATALOG_TYPE = `model/gltf-binary`;

export const SLOT_FOR_CORE_ID = 1000n;
export const FIXED_PART_CUBE_ID = 1n;

export const SLOT_FOR_CORE_METADATA = `${BASE_URI}/catalog/slots/core.json`;
export const FIXED_PART_CUBE_METADATA = `${BASE_URI}/catalog/fixed/main.json`;

export const CUBE_ASSET_METADATA_URI = `${BASE_URI}/hypercube/full/1.json`;
export const CORE_ASSET_METADATA_URI_1 = `${BASE_URI}/items/core_1/core.json`;
export const CORE_ASSET_METADATA_URI_2 = `${BASE_URI}/items/core_2/core.json`;
export const CORE_ASSET_METADATA_URI_3 = `${BASE_URI}/items/core_3/core.json`;
export const CORE_ASSET_METADATA_URI_4 = `${BASE_URI}/items/core_4/core.json`;
export const CORE_ASSET_METADATA_URI_5 = `${BASE_URI}/items/core_5/core.json`;
export const CORE_ASSET_METADATA_URI_6 = `${BASE_URI}/items/core_6/core.json`;
export const CORE_ASSET_METADATA_URI_7 = `${BASE_URI}/items/core_7/core.json`;

export const ALL_CORE_ASSET_METADATA_URIS = [
  CORE_ASSET_METADATA_URI_1,
  CORE_ASSET_METADATA_URI_2,
  CORE_ASSET_METADATA_URI_3,
  CORE_ASSET_METADATA_URI_4,
  CORE_ASSET_METADATA_URI_5,
  CORE_ASSET_METADATA_URI_6,
  CORE_ASSET_METADATA_URI_7,
];

export const PART_TYPE_SLOT = 1n;
export const PART_TYPE_FIXED = 2n;
export const CORE_EQUIPPABLE_GROUP_ID = SLOT_FOR_CORE_ID;

export const Z_INDEX_FOR_CUBE = 0n;
export const Z_INDEX_FOR_CORE = 1n;
