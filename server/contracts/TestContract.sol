pragma solidity ^0.4.4;

contract TestContract {
    string myString = "";
    
    function setMyString(string _myString) {
        myString = _myString;
    }
    
    function getMyString() constant returns (string) {
        return myString;
    }
}