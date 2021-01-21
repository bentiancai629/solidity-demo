pragma solidity >=0.5.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

interface IGateway {
    function mint(
        bytes32 _pHash,
        uint256 _amount,
        bytes32 _nHash,
        bytes calldata _sig
    ) external returns (uint256);

    function burn(bytes calldata _to, uint256 _amount)
        external
        returns (uint256);
}

interface IGatewayRegistry {
    function getGatewayBySymbol(string calldata _tokenSymbol)
        external
        view
        returns (IGateway);

    function getTokenBySymbol(string calldata _tokenSymbol)
        external
        view
        returns (IERC20);
}

contract Basic {
    // depolyee param: "0x557e211EC5fc9a6737d2C6b7a1aDe3e0C11A8D5D"
    IGatewayRegistry public registry; // interface
    event Deposit(uint256 _amount, bytes _msg);
    event Withdrawal(bytes _to, uint256 _amount, bytes _msg);

    constructor(IGatewayRegistry _registry) public {
        registry = _registry;
    }

    // deposit BTC to renBtc
    function deposit(
        // Parameters from users
        bytes calldata _msg, // renVM?
        // Parameters from Darknodes
        uint256 _amount,
        bytes32 _nHash,
        bytes calldata _sig
    ) external {
        bytes32 pHash = keccak256(abi.encode(_msg)); // hash(payload data)
        uint256 mintedAmount = registry.getGatewayBySymbol("BTC").mint(
            pHash,
            _amount,
            _nHash,
            _sig
        );

        // call event
        emit Deposit(mintedAmount, _msg);
    }

    // burn renBTC to unlock BTC
    function withdraw(
        bytes calldata _msg, //renVM?
        bytes calldata _to, // BTC address
        uint256 _amount
    ) external {
        uint256 burnedAmount = registry.getGatewayBySymbol("BTC").burn(
            _to,
            _amount
        );
        emit Withdrawal(_to, burnedAmount, _msg);
    }

    //balance
    function balance() public view returns (uint256) {
        // registry.getTokenBySymbol("BTC") == renBTC contract address
        return registry.getTokenBySymbol("BTC").balanceOf(address(this));
    }
}
