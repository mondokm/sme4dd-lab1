// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./BlindAuction.sol";

contract AuctionFactory {
	// TODO create state variables here

	function createAuction(
		uint biddingTime,
		uint revealTime,
		address payable beneficiaryAddress,
		address tokenAddress,
		uint256 tokenId
	) public returns (address) {
		
		// TODO create and store BlindAction
		
		return address(0);
	}
}
