// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.21;

import {
    RMRKAbstractEquippable
} from "@rmrk-team/evm-contracts/contracts/implementations/abstract/RMRKAbstractEquippable.sol";
import {
    RMRKImplementationBase
} from "@rmrk-team/evm-contracts/contracts/implementations/utils/RMRKImplementationBase.sol";

contract Core is RMRKAbstractEquippable {
    // Events
    /**
     * @notice From ERC4906 This event emits when the metadata of a token is changed.
     *  So that the third-party platforms such as NFT market could
     *  get notified when the metadata of a token is changed.
     */
    event MetadataUpdate(uint256 _tokenId);

    // Variables

    // Constructor
    constructor(
        string memory collectionMetadata,
        uint256 maxSupply,
        address royaltyRecipient,
        uint16 royaltyPercentageBps
    )
        RMRKImplementationBase(
            "Core",
            "CR",
            collectionMetadata,
            maxSupply,
            royaltyRecipient,
            royaltyPercentageBps
        )
    {}

    // Methods
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        _requireMinted(tokenId);
        // This will revert if the token has not assets, only use if at least an asset is assigned on mint to every token
        return getAssetMetadata(tokenId, _activeAssets[tokenId][0]);
    }

    /**
     * @notice Hook that is called after an asset is accepted to a token's active assets array.
     * @param tokenId ID of the token for which the asset has been accepted
     * @param index Index of the asset in the token's pending assets array
     * @param assetId ID of the asset expected to have been located at the specified index
     * @param replacedAssetId ID of the asset that has been replaced by the accepted asset
     */
    function _afterAcceptAsset(
        uint256 tokenId,
        uint256 index,
        uint64 assetId,
        uint64 replacedAssetId
    ) internal virtual override {
        if (replacedAssetId != 0) {
            emit MetadataUpdate(tokenId);
        }
    }

    /**
     * @notice Used to mint a desired number of child tokens to a given parent token.
     * @dev The "data" value of the "_safeMint" method is set to an empty value.
     * @dev Can only be called while the open sale is open.
     * @param to Address of the collection smart contract of the token into which to mint the child token
     * @param destinationId ID of the token into which to mint the new child token
     * @param assetIds ID of the assets to be minted, each asset is added to a new NFT
     * @return The ID of the first token to be minted in the current minting cycle
     */
    function nestMint(
        address to,
        uint256 destinationId,
        uint64[] memory assetIds
    ) public onlyOwnerOrContributor returns (uint256) {
        uint256 numToMint = assetIds.length;
        (uint256 nextToken, uint256 totalSupplyOffset) = _prepareMint(
            numToMint
        );

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _nestMint(to, i, destinationId, "");
            _addAssetToToken(i, assetIds[i - nextToken], 0);
            unchecked {
                ++i;
            }
        }

        return nextToken;
    }
}
