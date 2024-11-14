// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import { IERC721 } from "@openzeppelin/contracts/interfaces/IERC721.sol";
import { IERC721Receiver } from "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";

contract BlindAuction is IERC721Receiver {
    struct Bid {
        bytes32 blindedBid;
        uint deposit;
    }

    address payable public beneficiary;

    address public tokenAddress;
    uint256 public tokenId;

    uint public biddingEnd;
    uint public revealEnd;
    bool public ended;

    mapping(address => Bid[]) public bids;

    address public highestBidder;
    uint public highestBid;

    // Allowed withdrawals of previous bids
    mapping(address => uint) pendingReturns;

    event BidReceived(address sender, bytes32 blindedBid, uint deposit);
    event RevealedBid(address sender, bytes32 blindedBid, bool fake, uint value);
    event AuctionEnded(address winner, uint highestBid);

    // Errors that describe failures.

    /// The function has been called too early.
    /// Try again at `time`.
    error TooEarly(uint time);
    /// The function has been called too late.
    /// It cannot be called after `time`.
    error TooLate(uint time);
    /// The function auctionEnd has already been called.
    error AuctionEndAlreadyCalled();

    error NotFunded();

    // Modifiers are a convenient way to validate inputs to
    // functions. `onlyBefore` is applied to `bid` below:
    // The new function body is the modifier's body where
    // `_` is replaced by the old function body.
    modifier onlyBefore(uint time) {
        if (block.timestamp >= time) revert TooLate(time);
        _;
    }
    modifier onlyAfter(uint time) {
        if (block.timestamp <= time) revert TooEarly(time);
        _;
    }
    modifier onlyFunded() {
        if (!funded()) revert NotFunded();
        _;
    }

    // funding: belerakni az nft-t
    // IERC721Receiver impl
    // konstruktorban token address és tokenId
    // ercReceivedben check -> aukció indul
    // funded modifier

    constructor(
        uint _biddingEnd,
        uint _revealEnd,
        address payable _beneficiary,
        address _tokenAddress,
        uint256 _tokenId
    ) {
        beneficiary = _beneficiary;
        biddingEnd = _biddingEnd;
        revealEnd = _revealEnd;
        tokenAddress = _tokenAddress;
        tokenId = _tokenId;
    }

    /// Place a blinded bid with `blindedBid` =
    /// keccak256(abi.encodePacked(value, fake, secret)).
    /// The sent ether is only refunded if the bid is correctly
    /// revealed in the revealing phase. The bid is valid if the
    /// ether sent together with the bid is at least "value" and
    /// "fake" is not true. Setting "fake" to true and sending
    /// not the exact amount are ways to hide the real bid but
    /// still make the required deposit. The same address can
    /// place multiple bids.
    function bid(bytes32 blindedBid) external payable onlyBefore(biddingEnd) onlyFunded {
        bids[msg.sender].push(Bid({ blindedBid: blindedBid, deposit: msg.value }));
        emit BidReceived(msg.sender, blindedBid, msg.value);
    }

    /// Reveal your blinded bids. You will get a refund for all
    /// correctly blinded invalid bids and for all bids except for
    /// the totally highest.
    function reveal(
        uint[] calldata values,
        bool[] calldata fakes,
        bytes32[] calldata secrets
    ) external onlyAfter(biddingEnd) onlyBefore(revealEnd) onlyFunded {
        uint length = bids[msg.sender].length;
        require(values.length == length);
        require(fakes.length == length);
        require(secrets.length == length);

        uint refund;
        for (uint i = 0; i < length; i++) {
            Bid storage bidToCheck = bids[msg.sender][i];
            (uint value, bool fake, bytes32 secret) = (values[i], fakes[i], secrets[i]);
            if (bidToCheck.blindedBid == keccak256(abi.encodePacked(value, fake, secret))) {
                
                if (fake || bidToCheck.deposit < value) {
                    refund += bidToCheck.deposit;
                } else {
                    if (placeBid(msg.sender, value)) refund += bidToCheck.deposit - value;
                    else refund += bidToCheck.deposit;
                }

                emit RevealedBid(msg.sender, bidToCheck.blindedBid, fake, value);
                // Make it impossible for the sender to re-claim
                // the same deposit.
                bidToCheck.blindedBid = bytes32(0);
            }
            
        }
        payable(msg.sender).transfer(refund);
    }

    /// Withdraw a bid that was overbid.
    function withdraw() external {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `transfer` returns (see the remark above about
            // conditions -> effects -> interaction).
            pendingReturns[msg.sender] = 0;

            payable(msg.sender).transfer(amount);
        }
    }

    /// End the auction and send the highest bid
    /// to the beneficiary.
    function auctionEnd() external onlyAfter(revealEnd) onlyFunded {
        if (ended) revert AuctionEndAlreadyCalled();
        emit AuctionEnded(highestBidder, highestBid);

        ended = true;
        IERC721(tokenAddress).transferFrom(address(this), highestBidder, tokenId);
        beneficiary.transfer(highestBid);
    }

    // This is an "internal" function which means that it
    // can only be called from the contract itself (or from
    // derived contracts).
    function placeBid(address bidder, uint value) internal onlyFunded returns (bool success) {
        if (value <= highestBid) {
            return false;
        }
        if (highestBidder != address(0)) {
            // Refund the previously highest bidder.
            pendingReturns[highestBidder] += highestBid;
        }
        highestBid = value;
        highestBidder = bidder;
        return true;
    }

    // Returns whether the auction has been funded
    function funded() public view returns (bool success) {
        return IERC721(tokenAddress).balanceOf(address(this)) >= 1;
    }

    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be
     * reverted.
     *
     * The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(address, address, uint256 _tokenId, bytes calldata) external view returns (bytes4) {
        require(_tokenId == tokenId);
        require(IERC721(tokenAddress).balanceOf(address(this)) >= 1);

        return IERC721Receiver.onERC721Received.selector;
    }
}