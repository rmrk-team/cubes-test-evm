import {
  deployCubes,
  deployCores,
  deployCatalog,
  configureCatalog,
  addAssets,
} from './deploy-methods';
import * as C from './constants';
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const catalog = await deployCatalog(C.CATALOG_METADATA, C.CATALOG_TYPE);
  const cubes = await deployCubes();
  const cores = await deployCores();

  await configureCatalog(catalog, await cores.getAddress());
  await addAssets(cubes, cores, catalog);

  let tx = await cubes.setAutoAcceptCollection(await cores.getAddress(), true);
  await tx.wait();

  console.log('Deployment complete!');

  tx = await cubes.mint(deployer.address, 3, 1n);
  await tx.wait();
  console.log('Minted cube with id 1');

  let parentId = 1n;
  let assetIds = [1n, 2n, 3n];
  tx = await cores.nestMint(await cubes.getAddress(), parentId, assetIds);
  await tx.wait();
  console.log('Minted 3 cores to cube with id 1');

  parentId = 2n;
  assetIds = [4n, 5n];
  tx = await cores.nestMint(await cubes.getAddress(), parentId, assetIds);
  await tx.wait();
  console.log('Minted 2 cores to cube with id 2');

  parentId = 3n;
  assetIds = [6n, 7n];
  tx = await cores.nestMint(await cubes.getAddress(), parentId, assetIds);
  await tx.wait();
  console.log('Minted 2 cores to cube with id 3');

  console.log('Minting complete!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
