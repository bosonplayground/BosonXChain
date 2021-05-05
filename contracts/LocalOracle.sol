// SPDX-License-Identifier: LGPL-3.0-or-later

pragma solidity 0.7.1;

import "./ERC1155ERC721.sol";
import "./interfaces/ILocalOracle.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


contract LocalOracle is ILocalOracle {

    using SafeMath for uint256;

    // reference for ERC1155ERC721 contract
    ERC1155ERC721 erc1155erc721;

    // the event which will be emitted when help is needed from other blockchains
    event HelpMe(uint256 indexed tokenId, address indexed owner);
    // the event which will be emitted once help is received
    event HelpReceived(uint256 indexed tokenId, address indexed owner, uint256 indexed amount);
    // the event which will be emitted once a contract has burned their supply to help and proven 
    // smart contract are indeed very generous
    event ProvideHelp(uint256 indexed tokenId, address indexed owner, uint256 indexed amount);
 
    // set the ERC1155 address
    constructor(address _erc1155) {
        erc1155erc721 = ERC1155ERC721(_erc1155);
    }

    /**
        function which is callled when ERC115 quantity is burned
     */
    function helpMe(uint256 _quanityRemaining, address _account, uint256 _tokenId) external override {
        if(_quanityRemaining < 2) {
            emit HelpMe(_tokenId, _account);
        }
    }

    /**
    function which is called by an external party to confirm that help is received
    */
    function helpReceived(uint256 _tokenId, address _owner, uint256 _quantity) external override {
        erc1155erc721.mint(_owner, _tokenId, _quantity, "");
        emit HelpReceived(_tokenId, _owner, _quantity);
    }

    /**
        function to provide help to a contract in need
     */
    function provideHelp(uint256 _tokenId, address _owner) external override {
        // check quantity
        uint balance = erc1155erc721.balanceOf(_owner, _tokenId);
        
        //burn
        if (balance > 2) {
            uint256 helpQuantity = balance.sub(2);
            erc1155erc721.burn(_owner, _tokenId, helpQuantity);
            emit ProvideHelp(_tokenId, _owner, helpQuantity);
        }
    }

}
