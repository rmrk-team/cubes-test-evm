import { ethers, run, network } from 'hardhat';
import { delay, isHardhatNetwork } from './utils';
import {
  RMRKBulkWriter,
  RMRKCatalogImpl,
  RMRKCatalogUtils,
  RMRKCollectionUtils,
  RMRKEquipRenderUtils,
  RMRKRoyaltiesSplitter,
  Core,
  Cubes,
} from '../typechain-types';
import { getRegistry } from './get-gegistry';
import * as C from './constants';

export async function addAssets(
  cubes: Cubes,
  cores: Core,
  catalog: RMRKCatalogImpl,
): Promise<void> {
  console.log('Adding assets to Cubes...');

  let tx = await cubes.addEquippableAssetEntry(
    0n,
    await catalog.getAddress(),
    C.CUBE_ASSET_METADATA_URI,
    [C.SLOT_FOR_CORE_ID, C.FIXED_PART_CUBE_ID],
  );
  await tx.wait();

  for (let i = 0; i < C.ALL_CORE_ASSET_METADATA_URIS.length; i++) {
    let tx = await cores.addEquippableAssetEntry(
      C.CORE_EQUIPPABLE_GROUP_ID,
      ethers.ZeroAddress,
      C.ALL_CORE_ASSET_METADATA_URIS[i],
      [],
    );
    await tx.wait();
  }

  tx = await cores.setValidParentForEquippableGroup(
    C.CORE_EQUIPPABLE_GROUP_ID,
    await cubes.getAddress(),
    C.SLOT_FOR_CORE_ID,
  );
  await tx.wait();
}

export async function configureCatalog(
  catalog: RMRKCatalogImpl,
  coresAddress: string,
): Promise<void> {
  console.log('Configuring Catalog...');

  let tx = await catalog.addPart({
    partId: C.FIXED_PART_CUBE_ID,
    part: {
      itemType: C.PART_TYPE_FIXED,
      z: C.Z_INDEX_FOR_CUBE,
      equippable: [],
      metadataURI: C.FIXED_PART_CUBE_METADATA,
    },
  });
  await tx.wait();
  tx = await catalog.addPart({
    partId: C.SLOT_FOR_CORE_ID,
    part: {
      itemType: C.PART_TYPE_SLOT,
      z: C.Z_INDEX_FOR_CORE,
      equippable: [coresAddress],
      metadataURI: C.SLOT_FOR_CORE_METADATA,
    },
  });
  await tx.wait();
  console.log('Catalog configured');
}

export async function deployCubes(): Promise<Cubes> {
  console.log(`Deploying Cubes to ${network.name} blockchain...`);

  const contractFactory = await ethers.getContractFactory('Cubes');
  const args = [
    'ipfs://QmZR4H3x8cnfZaoh6e2PYDXGnv8MRbc2ggL5DXM8oKGPJG/hypercube/collection.json',
    100n,
    (await ethers.getSigners())[0].address,
    300,
  ] as const;
  const contract: Cubes = await contractFactory.deploy(...args);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Cubes deployed to ${contractAddress}`);

  if (!isHardhatNetwork()) {
    console.log('Waiting 10 seconds before verifying contract...');
    await delay(10000);
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args,
      contract: 'contracts/Cubes.sol:Cubes',
    });

    // Only do on testing, or if whitelisted for production
    const registry = await getRegistry();
    await registry.addExternalCollection(contractAddress, args[0]);
    console.log('Collection added to Singular Registry');
  }
  return contract;
}

export async function deployCores(): Promise<Core> {
  console.log(`Deploying Core to ${network.name} blockchain...`);

  const contractFactory = await ethers.getContractFactory('Core');
  const args = [
    'ipfs://QmZR4H3x8cnfZaoh6e2PYDXGnv8MRbc2ggL5DXM8oKGPJG/items/collection.json',
    100n,
    (await ethers.getSigners())[0].address,
    300,
  ] as const;
  const contract: Core = await contractFactory.deploy(...args);
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log(`Core deployed to ${contractAddress}`);

  if (!isHardhatNetwork()) {
    console.log('Waiting 10 seconds before verifying contract...');
    await delay(10000);
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args,
      contract: 'contracts/Core.sol:Core',
    });

    // Only do on testing, or if whitelisted for production
    const registry = await getRegistry();
    await registry.addExternalCollection(contractAddress, args[0]);
    console.log('Collection added to Singular Registry');
  }
  return contract;
}

export async function deployBulkWriter(): Promise<RMRKBulkWriter> {
  const bulkWriterFactory = await ethers.getContractFactory('RMRKBulkWriter');
  const bulkWriter = await bulkWriterFactory.deploy();
  await bulkWriter.waitForDeployment();
  const bulkWriterAddress = await bulkWriter.getAddress();
  console.log('Bulk Writer deployed to:', bulkWriterAddress);

  await verifyIfNotHardhat(bulkWriterAddress);
  return bulkWriter;
}

export async function deployCatalogUtils(): Promise<RMRKCatalogUtils> {
  const catalogUtilsFactory = await ethers.getContractFactory('RMRKCatalogUtils');
  const catalogUtils = await catalogUtilsFactory.deploy();
  await catalogUtils.waitForDeployment();
  const catalogUtilsAddress = await catalogUtils.getAddress();
  console.log('Catalog Utils deployed to:', catalogUtilsAddress);

  await verifyIfNotHardhat(catalogUtilsAddress);
  return catalogUtils;
}

export async function deployCollectionUtils(): Promise<RMRKCollectionUtils> {
  const collectionUtilsFactory = await ethers.getContractFactory('RMRKCollectionUtils');
  const collectionUtils = await collectionUtilsFactory.deploy();
  await collectionUtils.waitForDeployment();
  const collectionUtilsAddress = await collectionUtils.getAddress();
  console.log('Collection Utils deployed to:', collectionUtilsAddress);

  await verifyIfNotHardhat(collectionUtilsAddress);
  return collectionUtils;
}

export async function deployRenderUtils(): Promise<RMRKEquipRenderUtils> {
  const renderUtilsFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.waitForDeployment();
  const renderUtilsAddress = await renderUtils.getAddress();
  console.log('Equip Render Utils deployed to:', renderUtilsAddress);

  await verifyIfNotHardhat(renderUtilsAddress);
  return renderUtils;
}

export async function deployCatalog(
  catalogMetadataUri: string,
  catalogType: string,
): Promise<RMRKCatalogImpl> {
  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const catalog = await catalogFactory.deploy(catalogMetadataUri, catalogType);
  await catalog.waitForDeployment();
  const catalogAddress = await catalog.getAddress();
  console.log('Catalog deployed to:', catalogAddress);

  await verifyIfNotHardhat(catalogAddress, [catalogMetadataUri, catalogType]);
  return catalog;
}

export async function deployRoyaltiesSplitter(
  beneficiaries: string[],
  sharesBPS: number[],
): Promise<RMRKRoyaltiesSplitter> {
  const splitterFactory = await ethers.getContractFactory('RMRKRoyaltiesSplitter');
  const splitter = await splitterFactory.deploy(beneficiaries, sharesBPS);
  await splitter.waitForDeployment();
  const splitterAddress = await splitter.getAddress();
  console.log('RoyaltiesSplitter deployed to:', splitterAddress);

  await verifyIfNotHardhat(splitterAddress, [beneficiaries, sharesBPS]);
  return splitter;
}

async function verifyIfNotHardhat(contractAddress: string, args: any[] = []) {
  if (isHardhatNetwork()) {
    // Hardhat
    return;
  }

  // sleep 20s
  await delay(20000);

  console.log('Etherscan contract verification starting now.');
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    // probably already verified
  }
}
