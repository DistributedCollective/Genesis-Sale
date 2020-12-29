// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

interface Token {
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
}

contract tokenRecipient {
    event receivedTokens(address _from, uint256 _value, address _token, bytes _extraData);

    function receiveApproval(address _from, uint256 _value, address _token, bytes memory _extraData) public {
        Token t = Token(_token);
        require(t.transferFrom(_from, address(this), _value));
        emit receivedTokens(_from, _value, _token, _extraData);
    }
}