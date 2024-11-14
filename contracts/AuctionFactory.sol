// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./BlindAuction.sol";

contract AuctionFactory {
	address[] public auctionAddresses;

	function createAuction(
		uint biddingTime,
		uint revealTime,
		address payable beneficiaryAddress,
		address tokenAddress,
		uint256 tokenId
	) public returns (address) {
		address auction = address(new BlindAuction(biddingTime, revealTime, beneficiaryAddress, tokenAddress, tokenId));
		auctionAddresses.push(auction);
		return auction;
	}
}