# <a style="display:inline-block; min-width:20px">&#9830;</a> Ethereum

The following section is dedicated to the Ethereum and Oraclize integration.
To better profit from this section of the documentation, previous knowledge of Solidity and Ethereum is required.

The interaction between Oraclize and an Ethereum smart contract is asynchronous. Any request for data is composed of two steps:

* Firstly, in the most common case, a transaction executing a function of a smart contract is broadcasted by a user. The function contains a special instruction which manifest to Oraclize, who is constantly monitoring the Ethereum blockchain for such instruction, a request for data.
* Secondly, according to the parameters of such request, Oraclize will fetch or compute a result, build, sign and broadcast the transaction carrying the result. In the default configuration, such transaction will execute the `__callback` function which should be placed in the smart contract by its developer: for this reason, this transaction is referred in the documentation as the Oraclize callback transaction.

As said in previous sections, one of the fundamental characteristics of Oraclize is the capability of returning data to a smart contract together with one or more proofs of authenticity of the data. The generation of an authenticity proof is optional and it is a contract-wide setting which must be configured by the smart contract developer before the request for data is initiated. Oraclize always recommends the use of authenticity proofs for production deployments.

## Quick Start

```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleContract is usingOraclize {

   string public ETHUSD;
   event LogConstructorInitiated(string nextStep);
   event LogPriceUpdated(string price);
   event LogNewOraclizeQuery(string description);

   function ExampleContract() payable {
       LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");
   }

   function __callback(bytes32 myid, string result) {
       if (msg.sender != oraclize_cbAddress()) revert();
       ETHUSD = result;
       LogPriceUpdated(result);
   }

   function updatePrice() payable {
       if (oraclize_getPrice("URL") > this.balance) {
           LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
       } else {
           LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
           oraclize_query("URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
       }
   }
}
```

The most simple way to introduce the Ethereum - Oraclize integration, it is by showing a working example, such as the smart contract on the right.
This contract uses Oraclize to fetch the last ETH/USD from Coinbase Pro APIs. The update process is initiated every time the function updatePrice() is called. The example shows two important components of using Oraclize:

* The contract should be a child of the contract usingOraclize
* The contract usingOraclize is defined in the oraclizeAPI file, which can be fetched from the dedicated Oraclize Github repository.

The code in the example is working out of the box if Remix is used to compile and deploy it on any of the Ethereum networks: main-net and the Ropsten, Kovan and Rinkeby testnets. If, instead, another tool is used, it will be necessary to replace the import statement with a local import of the oraclizeAPI.sol file since direct import from Github may not be supported.

To ease development, Oraclize doesn't charge a contract for its first request of data done using the default gas parameters. Successive requests will require the contract to pay the Oraclize fee and the ether necessary to pay for the callback transaction. Both are automatically taken from the contract balance. If the contract doesn't have enough funds in his balance, the request will fail and Oraclize won't return any data.

<aside class="notice">
Only the first query is free. Ensure that the contract has a sufficient ETH balance to pay the following queries. The contract gets automatically charged on the `oraclize_query` call but fails if the balance is insufficient.
</aside>

### Simple Query

```javascript
// This code example will ask Oraclize to send as soon as possible
// a transaction with the primary result (as a string) of the given
// formula ("random number between 0 and 100") fetched from the
// data-source "WolframAlpha".
oraclize_query("WolframAlpha", "random number between 0 and 100");

oraclize_query("URL", "https://api.kraken.com/0/public/Ticker?pair=ETHXBT")

oraclize_query("URL",
  "json(https://www.therocktrading.com/api/ticker/BTCEUR).result.0.last")

oraclize_query("IPFS", "QmdEJwJG1T9rzHvBD8i69HHuJaRgXRKEQCP7Bh1BVttZbU")

// The URL datasource also supports a supplement argument, useful for creating HTTP POST requests.
// If that argument is a valid JSON string, it will be automatically sent as JSON.
oraclize_query("URL", "json(https://shapeshift.io/sendamount).success.deposit",
  '{"pair":"eth_btc","amount":"1","withdrawal":"1AAcCo21EUc1jbocjssSQDzLna9Vem2UN5"}')
```
A request for data is called **query**. The `oraclize_query` is a function, inhered from the parent usingOraclize contract, which expects at least two arguments:

* A data-source such as `URL`, `WolframAlpha`, `IPFS`, 'Swarm' and others listed here
* The argument for the given data-source. For examples:
 * the full `URL`, which may inclued the use of JSON or XML parsing helpers as it can be seen in the previous example
 * or a `WolframAlpha` formula
 * or an `IPFS` multihash

The number and type of supported arguments depends from the data-source in use. Beside, few more code example will be shown and commented. The datasource, as well as the authenticity proof chosen, determine the fee which the contract has to pay to Oraclize.


### Schedule a Query in the Future

```javascript
// Relative time: get the result from the given URL 60 seconds from now
oraclize_query(60, "URL",
  "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0")

// Absolute time: get the result from the given datasource at the specified UTC timestamp in the future
oraclize_query(scheduled_arrivaltime+3*3600,
  "WolframAlpha", strConcat("flight ", flight_number, " landed"));
```
The execution of a query can be scheduled in a future date. The function `oraclize_query` accepts as a parameter the delay in seconds from the current time or the timestamp in the future as first argument.
Please note that in order for the future timestamp to be accepted by Oraclize it must be within **60 days** of the current UTC time in the case of the absolute timestamp choice, or in the case of a relative time elapse, the elapsed seconds must equate to no more than **60 days**.

### Recursive Queries
```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleContract is usingOraclize {

    string public ETHUSD;
	event LogConstructorInitiated(string nextStep);
	event LogPriceUpdated(string price);
	event LogNewOraclizeQuery(string description);

    function ExampleContract() payable {
        LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) revert();
        ETHUSD = result;
		LogPriceUpdated(result);
		updatePrice();
    }

 	function updatePrice() payable {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
           	LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        	oraclize_query(60, "URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
        }
    }

```
Smart contracts using Oraclize can be effectively autonomous by implementing a new call to Oraclize into their  ` __callback` method. This can be useful for implementing periodic updates of some on-chain reference data, as with price feeds, or to periodically check for some off-chain conditions.

This modified version of the previous example will update the ETH/USD exchange rate every 60 seconds whilst the contract has enough funds to pay for the Oraclize fee.

<aside class="notice">
Use recursive queries cautiously! They will continue until a contract is drained of ETH if left unchecked!
</aside>

### The Query ID
```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleContract is usingOraclize {

    string public ETHUSD;
	mapping(bytes32=>bool) validIds;
	event LogConstructorInitiated(string nextStep);
	event LogPriceUpdated(string price);
    event LogNewOraclizeQuery(string description);

    function ExampleContract() payable {
        LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (!validIds[myid]) revert();
		if (msg.sender != oraclize_cbAddress()) revert();
        ETHUSD = result;
		LogPriceUpdated(result);
		delete validIds[myid];
		updatePrice();
    }

 	function updatePrice() payable {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
           	LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
			bytes32 queryId =
				oraclize_query(60, "URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
			validIds[queryId] = true;
        }
    }
}
```

Every time the function `oraclize_query` is called, it returns a unique ID, hereby referred to as `queryId`, which depends from the number of previous requests and the address of smart contract.
The queryId identifies a specific query done to Oraclize and it is returned to the contract as a parameter of the callback transaction.

Oraclize recommends smart contract developers to verify if the queryId sends by the callback transaction was generated by a valid call to the `oracize_query` function, as shown in the example accompanying this paragraph. This ensures that each query response is processed only once and helps avoid misuse of the smart contract logic. Moreover, it protects the smart contract during blockchain reorganizations, as explained in the dedicated paragraph of this section.

The `queryId` can be used as well to implement different behaviors into the `__callback` function, in particular when there is more than one pending call from Oraclize.

### Custom Gas Limit and Gas Price
```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleContract is usingOraclize {

    string public ETHUSD;
	mapping(bytes32=>bool) validIds;
	event LogConstructorInitiated(string nextStep);
	event LogPriceUpdated(string price);
	event LogNewOraclizeQuery(string description);

	// This example requires funds to be send along with the contract deployment
	// transaction
    function ExampleContract() payable {
        oraclize_setCustomGasPrice(4000000000);
		LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (!validIds[myid]) revert();
		if (msg.sender != oraclize_cbAddress()) revert();
        ETHUSD = result;
		LogPriceUpdated(result);
		delete validIds[myid];
		updatePrice();
    }

 	function updatePrice() payable {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
           	LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
			bytes32 queryId =
				oraclize_query(60, "URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price", 500000);
			validIds[queryId] = true;
        }
    }
}
```

The transaction originating from Oraclize to the  `__callback` function pays a fee to the miner which include the transaction in a block, just like any other transaction. The miner fee is paid in Ether and it is calculated by taking the amount of gas which covers the execution costs of the transaction multiplied by the selected gas/ether price. Oraclize will set those parameters accordingly to the parameters specified in the smart contract, for contract-wide settings, and in the `oraclize_query` function, for query-specific settings. The miner fee for the callback transaction is taken from the contract balance when the query transaction is executed.

If no settings are specified, Oraclize will use the default values of 200,000 gas and 20 GWei. This last value is on the higher-end of the pricing spectrum right now, but it helps having faster confirmation times during network-wide congestions.

A different value for the Oraclize callback gas can be passed as the argument `_gasLimit` to the `oraclize_query` function as shown in the following examples.

```javascript
// If the callback transaction requires little gas, the value can be lowered:
oraclize_query("URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price", 100000);

// Callback methods may be expensive. The example requires the JSON parsing
// a string in the smart contract. If that's the case, the gas should be increased:
oraclize_query("URL", "https://api.pro.coinbase.com/products/ETH-USD/ticker", 500000);
```

The gas price of the callback transaction can be set by calling the `oraclize_setCustomGasPrice` function, either in the constructor, which is executed once at deployment of the smart contract, or in a separate function. The following is the ExampleContract modified to specify a custom gas price of 4 Gwei and a custom gas limit for the callback transaction.

Smart contract developers should estimate correctly and minimize the cost of their `__callback` method, as any unspent gas will be returned to Oraclize and no refund is available.

<aside class="notice">
When calling `oraclize_setCustomGasPrice` the parameter type is uint and represents the amount of wei. However, there is no need to put `wei` keyword in the parameter.
</aside>


### Query Rebroadcasts

When making Provable queries, users are able to specify custom gas limits and gas prices for them as outlined __[in this section here.](http://docs.oraclize.it/#ethereum-quick-start-custom-gas-limit-and-gas-price)__ However, due to the asynchronous nature of Provable queries and the volatility of gas-prices on the Ethereum Mainnet, a user may occasionally find themselves in a situation where the gas price they have requested for their callback transaction is no longer high enough to ensure the transaction gets mined quickly. This is especially true when using delayed queries, where the likelihood of the congestion level of the Ethereum network when the query was made being the same as when the delayed callback is due diminishes.

In such cases, users have the ability to request a _rebroadcast_ of their transaction, via which the user may specify new, higher parameters for both the gas limit and the gas price:

```javascript
uint256 newGasLimit = <new-gas-limit>;
uint256 newGasPrice = <new-gas-price>;

oraclize_requestCallbackRebroadcast(
  <query-id>,
  newGasLimit,
  newGasPrice
  oraclize_getRebroadcastCost(newGasLimit, newGasPrice)
);
```

This way, the effects of the changing network conditions can be mitigated, ensuring callbacks are always received in a timely manner.

<aside class="notice">
Currently, query rebroadcasts can __only__ be paid for with ETH, which - like in any other Provable query - is taken out of the contract at the time the call is made. In future, any of the eligible ERC20 tokens that are on the Provable whitelist may also be used for query rebroadcast payments.
</aside>

Another useful feature of rebroadcasting is in giving a user a finer-control over the gas limit of their callback. Should a query be sent with an amount of gas too low for the `__callback()` to fully execute, the query would normally `revert()` and be wasted. Now a user has the ability to request a rebroadcast on that query and thus the opportunity to make changes to the gas limit in order to remedy the situation.

In order to enable rebroadcasts, a contract writer must explicitly define the following in the storage of their contract: `bool public constant allowQueryRebroadcasts = true;`. Any attempts to rebroadcast a query destined for a contract which does not have the preceding line present will be unfulfilled.

Just like a normal query, any over-payment is refunded, but always to the _final calling contract_. Which latter gives rise to two important caveats:

- The first is that the refund will _always_ go to the final calling contract, and so if the call for a rebroadcast is proxied via another contract, the refund will always be made to the contract that implements the API, and not necessarily to the contract which initiated and paid for the call.

- The second caveat is that the final calling contract will also require a payable `fallback()` function in order to receive refunds in such cases. If the payable fallback is omitted, any refund attempt will cause the query to `revert();`.

Due to the above, it is strongly recommended that queries be paid for using their exact cost, which can be calculated via: `oraclize_getRebroadcastCost(<new-gas-limit>, <new-gas-price>);`

<aside class="notice">
It is up to the contract writer to ensure that the gas limit and gas price of the requested rebroadcast are _greater than or equal_ to the parameters used in the original query. Attempts made using a lower gas limit or gas price will be ignored by the service and requested rebroadcast will not occur.
</aside>

### Authenticity Proofs

```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleContract is usingOraclize {

    string public ETHUSD;
	mapping(bytes32=>bool) validIds;
	event LogConstructorInitiated(string nextStep);
	event LogPriceUpdated(string price);
	event LogNewOraclizeQuery(string description);


	// This example requires funds to be send along with the contract deployment
	// transaction
	function ExampleContract() payable {
        oraclize_setCustomGasPrice(4000000000);
		oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
		LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");
    }

    function __callback(bytes32 myid, string result, bytes proof) {
        if (!validIds[myid]) revert();
		if (msg.sender != oraclize_cbAddress()) revert();
        ETHUSD = result;
		LogPriceUpdated(result);
		delete validIds[myid];
		updatePrice();
    }

 	function updatePrice() payable {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
           	LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
			bytes32 queryId =
				oraclize_query(60, "URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price", 500000);
			validIds[queryId] = true;
        }
    }
}
```
Authenticity proofs are at the core of Oraclize's oracle model. Smart contracts can request authenticity proofs together with their data by calling the `oraclize_setProof` function available in the usingOraclize. The authenticity proof can be either deliver directly to the smart contract or it can be saved, upload and stored on <a href="http://ipfs.io/" target="_blank">IPFS</a>.

When a smart contract requests for an authenticity proof, it **must** define a different callback function with the following arguments: `function __callback(bytes32 queryId, string result, bytes proof)`

The `oraclize_setProof` function expects the following format: `oraclize_setProof(proofType_ | proofStorage_ )`

Both proofType and proofStorage are byte constants defined in usingOraclize:

Available parameters for proofTypes are:

* `proofType_NONE`: the default value of any smart contracts
* `proofType_TLSNotary`: available only on the *Ethereum Mainnet*
* `proofType_Android`
* `proofType_Native`
* `proofType_Ledger`

While for proofStorage:

* `proofStorage_IPFS`

For example, `oraclize_setProof(proofType_TLSNotary)` will return the full TLSNotary Proof bytes as the proof argument in the callback transaction. If instead `oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS)` is used, then Oraclize will return only the base58-decoded IPFS multihash as the proof argument. To obtain the IPFS multihash, the bytes must be encoded to base58.
The method `oraclize_setProof` can be executed in the constructor, becoming a contract-wide lasting setting, or it can be set directly before a specific query is to be made. Authenticity proofs can be disabled by calling `oraclize_setProof(proofType_NONE)`. Smart contract developer should be aware that the helper method `oraclize_setProof` is an internal function of usingOraclize, and therefore it must be included specifically in their smart contract at compile time, before deployment.
The following builds on our previous example:


### Verifiability

Supported proofs can be verified. The following tools can be used: <a href="#development-tools-network-monitor">Verification Tools</a>


## Best Practices

### Pre-calculating the Query Price

```javascript
pragma solidity ^0.4.0;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract KrakenPriceTicker is usingOraclize {

    string public ETHXBT;
    uint constant CUSTOM_GASLIMIT = 150000;

    event newKrakenPriceTicker(string price);
    event newOraclizeQuery(string description);

    function KrakenPriceTicker()
        public
    {
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        update(); // Update price on contract creation...
    }

    function __callback(
        bytes32 myid,
        string result,
        bytes proof
    ) {
        require(msg.sender == oraclize_cbAddress());
        ETHXBT = result;
        newKrakenPriceTicker(ETHXBT);
    }

    function update()
        payable
    {
        if (oraclize_getPrice("URL", CUSTOM_GASLIMIT) > this.balance) {
            newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0", CUSTOM_GASLIMIT);
        }
    }
}

```

Payment for Provable queries are debited directly from the contract that calls the `oraclize_query(...)'` function at the moment that function call is made. In order for that to succeed, either the contract itself needs to hold a balance of ETH, or the contract needs to implement logic to burden the contract-caller to supply the ETH. Either way, you may want to know ahead of time the price of the next query before making it. Provable provides a helper method to do just that: `oraclize_getPrice(string _datasource);`.

If your contract is paying for queries from its own balance, it is possible gracefully handle the scenario where that balance has dropped below the cost of the query price using this helper function. Otherwise, if the balance is insufficient to cover the query at the time the query is attempted, it will fail via: `revert('Error settling query payment');`. The `update();` function in the sample contract on the right demonstrates how to implement the `oraclize_getPrice()` helper in order to perform this balance check before making a Provable query.

The `oraclize_getPrice` helper function is overloaded and so can also accept a gas limit parameter: `oraclize_getPrice(string _datasource, uint256 _gasLimit);`. This allowing you to get accurate prices for queries that use a gas limit different from the `200,000` default.

<aside class="notice">
When using a custom gas limit, to correctly calculate your contract's _next_ query price, ensure that you use the same custom gas limit parameter for the call to `getPrice(string _datasource, uint256 _gasLimit);` as you intend to use in your actual query!
</aside>

`oraclize_getPrice` can also accept an `address` parameter, allowing you to discover prices for queries for _any_ contract, rather than just only the contract that is actually calling: `oraclize_getPrice(string _datasource, address _contractAddress);`.

Finally, `oraclize_getPrice` can accept a combination of parameters allowing the discovery of very specific query prices for any datasource combined with any proof-type, using any custom gas limit, any custom gas price and for any desired contract: `oraclize_getPrice(string _datasource, uint256 _gasLimit, uint256 _gasPrice, bytes1 _proofType);`

<aside class="notice">
Note that the first query to the Provable service is _free_, and so the first call to `oraclize_getPrice` from a contract with a gas limit and/or gas price that is _less than or equal_ to the default values will result in the function _correctly_ returning `0`.
</aside>

```javascript

/**
 *
 * @notice All oraclize_getPrice(...) function overloads:
 *
 */

// For datasource prices...
oraclize_getPrice(string datasource);
oraclize_getPrice(bytes1 datasource);

// For prices involing custom gas limits...
oraclize_getPrice(string datasource, uint256 _gasLimit);
oraclize_getPrice(bytes1 datasource, uint256 _gasLimit);

// For query prices for addresses other than the calling contract...
oraclize_getPrice(string datasource, address _address);
oraclize_getPrice(bytes1 datasource, address _address);

// For prices involving custom gas limits and custom gas prices...
oraclize_getPrice(string datasource, uint256 _gasLimit, uint256 _gasPrice);
oraclize_getPrice(bytes1 datasource, uint256 _gasLimit, uint256 _gasPrice);

// For prices involving different datasource & prooftype combinations...
oraclize_getPrice(string datasource, uint256 _gasLimit, uint256 _gasPrice, bytes1 _proofType);
oraclize_getPrice(bytes1 datasource, uint256 _gasLimit, uint256 _gasPrice, bytes1 _proofType);


```

### Mapping Query Ids

```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleContract is usingOraclize {

    string public ETHUSD;
    event LogConstructorInitiated(string nextStep);
    event LogPriceUpdated(string price);
    event LogNewOraclizeQuery(string description);

    mapping (bytes32 => bool) public pendingQueries;

    function ExampleContract() payable {
        LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Oraclize Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) revert();
        require (pendingQueries[myid] == true);
        ETHUSD = result;
        LogPriceUpdated(result);
        delete pendingQueries[myid]; // This effectively marks the query id as processed.
    }

    function updatePrice() payable {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            bytes32 queryId = oraclize_query("URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
            pendingQueries[queryId] = true;
        }
    }
}
```

It might occur that a callback function of a sent query gets called more than once. Therefore it might be helpful to initiate a mapping that manages the query ids and their states. When the callback function of a query gets called, the require statement checks if the current query id needs to be processed. After one successful iteration the id gets deleted to prevent further callbacks for that particular id.


## Advanced Topics

### Encrypted Queries
Certain contexts, such as smart contracts on public blockchains, might require a level of privacy to protect data from public scrutiny. Developers can make encrypted Oraclize queries by encrypting a part (or all) of a query with the Oraclize public key.
The encrypted queries feature may be of interest to developers who want to deploy their blockchain applications on public networks. For example, if an application leverages data from an authenticated API, it may be dangerous to disclose the API key to anybody who is monitoring the public chain.

Oraclize therefore offers the possibility of encrypting the parameters contained in a query to Oraclize's public key: `044992e9473b7d90ca54d2886c7addd14a61109af202f1c95e218b0c99eb060c7134c4ae46345d0383ac996185762f04997d6fd6c393c86e4325c469741e64eca9`
Only Oraclize will then be able to decrypt the request using its paired private key.

To encrypt the query, Oraclize provides a CLI tool, which can be found <a href="https://github.com/oraclize/encrypted-queries" target="_blank">here</a>. Alternatively,
The CLI command to encrypt an arbitrary string of text is then:

`python encrypted_queries_tools.py -e -p 044992e9473b7d90ca54d2886c7addd14a61109af202f1c95e218b0c99eb060c7134c4ae46345d0383ac996185762f04997d6fd6c393c86e4325c469741e64eca9 "YOUR QUERY"`

This will encrypt the query with the default Oraclize public key. The encrypted string can then be used as an argument for an Oraclize query.

```javascript
// In this example, the entire first argument of an oraclize_query has been encrypted.
// The actual string encrypted is:  json(https://poloniex.com/public?command=returnTicker).BTC_ETH.last
oraclize_query("URL","AzK149Vj4z65WphbBPiuWQ2PStTINeVp5sS9PSwqZi8NsjQy6jJLH765qQu3U/
  bZPNeEB/bYZJYBivwmmREXTGjmKJk/62ikcO6mIMQfB5jBVVUOqzzZ/A8ecWR2nOLv0CKkkkFzBYp2sW1H
  31GI+SQzWV9q64WdqZsAa4gXqHb6jmLkVFjOGI0JvrA/Zh6T5lyeLPSmaslI");
```

<aside class="notice">
You could also encrypt only 1 parameter of oraclize_query(), leaving the other ones in cleartext.
</aside>

The encryption method is also available for POST requests: you can encrypt both the URL and the POST data field as in the following example:

```javascript
// This is the query that we want to encrypt
oraclize_query("URL","json(https://api.postcodes.io/postcodes).status",
  '{"postcodes" : ["OX49 5NU", "M32 0JG", "NE30 1DP"]}')
```


Encrypt the datasource (URL in this case):<br>
`python encrypted_queries_tools.py -e -p 044992e94... "URL"`

Returns: <br>
`BEIGVzv6fJcFiYQNZF8ArHnvNMAsAWBz8Zwl0YCsy4K/RJTN8ERHfBWtSfYHt+uegdD1wtXTkP30sTW+3xR3w/un1i3caSO0Rfa+wmIMmNHt4aOS`
<br>
<br>

Encrypt the argument(in this case we are using the JSON parsing helper to retrieve the "status" ):<br>
`python encrypted_queries_tools.py -e -p 044992e94... "json(https://api.postcodes.io/postcodes).status"`

Returns:<br>
`BNKdFtmfmazLLR/bfey4mP8v/R5zCIUK7obcUrF2d6CWUMvKKUorQqYZNu1YfRZsGlp/F96CAQhSGomJC7oJa3PktwoW5J1Oti/y2v4+b5+vN8yLIj1trS7p1l341Jf66AjaxnoFPplwLqE=`
<br>
<br>

Encrypt the JSON (third argument, the data to POST):<br>
`python encrypted_queries_tools.py -e -p 044992e94... '{"postcodes" : ["OX49 5NU", "M32 0JG", "NE30 1DP"]}'`

Returns:<br>
`BF5u1td9ugoacDabyfVzoTxPBxGNtmXuGV7AFcO1GLmXkXIKlBcAcelvaTKIbmaA6lXwZCJCSeWDHJOirHiEl1LtR8lCt+1ISttWuvpJ6sPx3Y/QxTajYzxZfQb6nCGkv+8cczX0PrqKKwOn/Elf9kpQQCXeMglunT09H2B4HfRs7uuI`
<br>
<br>

```javascript
// Finally we add all the encrypted text
// to the oraclize_query (in the right order)
oraclize_query("BEIGVzv6fJcFiYQNZF8ArHnvNMAsAWBz8Zwl0YCsy4K/RJTN8ERHfBWtSfYHt+
  uegdD1wtXTkP30sTW+3xR3w/un1i3caSO0Rfa+wmIMmNHt4aOS","BNKdFtmfmazLLR/bfey4mP8
  v/R5zCIUK7obcUrF2d6CWUMvKKUorQqYZNu1YfRZsGlp/F96CAQhSGomJC7oJa3PktwoW5J1Oti/
  y2v4+b5+vN8yLIj1trS7p1l341Jf66AjaxnoFPplwLqE=", "BF5u1td9ugoacDabyfVzoTxPBxG
  NtmXuGV7AFcO1GLmXkXIKlBcAcelvaTKIbmaA6lXwZCJCSeWDHJOirHiEl1LtR8lCt+1ISttWuvp
  J6sPx3Y/QxTajYzxZfQb6nCGkv+8cczX0PrqKKwOn/Elf9kpQQCXeMglunT09H2B4HfRs7uuI");
```

You can also do this with a request to another datasource like WolframAlpha, the Bitcoin blockchain, or IPFS. Our encryption system also permits users to encrypt any of the supported datasource options.

<aside class="notice">
In order to prevent other users from using your exact encrypted query ("replay attacks"), the first contract querying Oraclize with a given encrypted query becomes its rightful "owner". Any other contract using that exact same string will receive an empty result.

As a consequence, remember to always generate a new encrypted string when re-deploying contracts using encrypted queries.
</aside>

<aside class="notice">
The security guarantee mentioned above is only valid on the mainnet, not on the testnet. For more information get in touch with info@oraclize.it.
</aside>

To protect the plaintext queries, an Elliptic Curve Integrated Encryption Scheme was chosen. The steps performed for the encryption are the following ones:

* An Elliptic Curve Diffie-Hellman Key Exchange (ECDH), which uses secp256k1 as curve and ANSI X9.63 with SHA256 as Key Derivation Function. This algorithm is used to derive a shared secret from the Oraclize public key and ad-hoc, randomly generated developer private key.
* The shared secret is used by an AES-256 in Galois Counter Mode (GCM), an authenticated symmetric cipher, to encrypt the query string. The authentication tag is 16-bytes of length and the IV is chosen to be '000000000000' (96 bits of length). The IV can be set to the zero byte-array because each shared secret is thrown-away and use only once. Every time the encryption function is called a new developer private key is re-generated. The final ciphertext is the concatenation of the encoded point (i.e the public key of the developer), the authentication tag and the encrypted text.

### Cached Queries

It is common for oracle-leveraging smart-contracts to be relatively simple in their external datasource needs. Frequently, a contract will have a static query that always calls the same endpoint with the same parameters. In such cases, Provable have implemented a method whereby queries can be _cached_ in order to make large gas savings when making the query. The gas-savings can be upwards of 50% of the original gas price of the query.

To enable query caching, a contract must first make a standard Provable query using whichever datasource & parameters are required, and then save the `bytes32` query ID that Provable returns: `bytes32 cachedQueryID = oraclize_query(<datasource>, <args>);`. Next, a contract should enable caching of that specific query, using its ID, by calling: `oraclize_requestQueryCaching(cachedQueryId);`.

Thereafter, a contract may make a _new_ query using the cached query’s parameters via: `oraclize_queryCached(<query-price>);`. This will return a _new_ queryID in order for the query to be tracked within your contract’s context. The new query made will have exactly the parameters of the query which was originally cached by the contract.

<aside class="notice">
Notice that the only parameter required by `oraclize_queryCached` is the _cost_ of that query. You can use the `oraclize_getPrice` helper function __[explained here](http://docs.oraclize.it/#ethereum-best-practices-pre-calculating-the-query-price)__ in order to get the correct price of the query: `oraclize_queryCached(oraclize_getPrice(<datasource>));`. The `bytes32` ID of the query has already been cached and so is not required.
</aside>

See the example contract to the right for a contract that sets up and then uses cached queries in a recursive manner in order to benefit from the large gas savings when using a single, static query.

<aside class="notice">
Currently, cached-queries can __only__ be paid for with ETH. In future, any of the eligible ERC20 tokens that are on the Provable token whitelist may also be used for cached-query payments.
</aside>

```javascript

pragma solidity >= 0.5.0 < 0.6.0;

contract RecursiveCachedQueryExample is usingOraclize {

    bytes32 cachedQueryID;
    string public priceETHXBT;

    event LogNewKrakenPriceTicker(string price);
    event LogNewOraclizeQuery(string description);

    constructor()
        payable
        public
    {
        updateAndRequestQueryCaching(); // Note: Set the recursive queries going on contract creation...
    }
    /**
     *
     * @dev Notice here that we make a normal Provable query and save the
     *      returned query ID, which is then used to request caching of the
     *      specific query using that ID just saved.
     *
     */
    function updateAndRequestQueryCaching()
        public
        payable
    {
        emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer...");
        cachedQueryID = oraclize_query(
            "URL",
            "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0"
        );
        oraclize_requestQueryCaching(cachedQueryID);
    }
    /**
     *
     * @dev Now here we are making the *same* Provable query as above but by
     *      simply calling `oraclize_queryCached(...)`. Notice too how we
     *      provide to it the cost of the query which is a required parameter.
     *
     */
    function updateCached()
        public
        payable
    {
        emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer...");
        oraclize_queryCached(oraclize_getPrice("URL"));
    }
    /**
     *
     * @dev When the Provable service returns our result and calls this
     *      callback,  we call our *cached* version of the update function,
     *      thus continuing the asynchronous recursion.
     *
     */
    function __callback(
        bytes32 myid,
        string memory result,
        bytes memory proof
    )
        public
    {
        require(msg.sender == oraclize_cbAddress());
        updateCached();
        priceETHXBT = result;
        emit LogNewKrakenPriceTicker(priceETHXBT);
    }
}

```

### Computation Data Source

#### Passing Arguments to the Package
```javascript
pragma solidity ^0.4.18;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract Calculation is usingOraclize {

    string NUMBER_1 = "33";
    string NUMBER_2 = "9";
    string MULTIPLIER = "5";
    string DIVISOR = "2";

    event LogNewOraclizeQuery(string description);
    event calculationResult(uint _result);

    // General Calculation: ((NUMBER_1 + NUMBER_2) * MULTIPLIER) / DIVISOR

    function Calculation() {
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
    }

    function __callback(bytes32 myid, string result, bytes proof) {
        require (msg.sender == oraclize_cbAddress());
        calculationResult(parseInt(result));
    }

    function testCalculation() payable {
        sendCalculationQuery(NUMBER_1, NUMBER_2, MULTIPLIER, DIVISOR); // = 105
    }

    function sendCalculationQuery(string _NUMBER1, string _NUMBER2, string _MULTIPLIER, string _DIVISOR) payable {
        if (oraclize.getPrice("computation") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("computation",["QmZRjkL4U72XFXTY8MVcchpZciHAwnTem51AApSj6Z2byR",
            _NUMBER1,
            _NUMBER2,
            _MULTIPLIER,
            _DIVISOR]);
        }
    }
}
```
Arguments can be passed to the package by adding parameters to the query array. They will be accessible from within the Docker instances as environmental parameters.

Currenty the API supports up to 5 inline arguments, including the IPFS Hash:
`oraclize_query("computation",["QmZRjkL4U72XFXTY8MVcchpZciHAwnTem51AApSj6Z2byR", _firstOperand, _secondOperand, _thirdOperand, _fourthOperand]);`

```shell
# Content of the Dockerfile

FROM frolvlad/alpine-python3
MAINTAINER Oraclize "info@oraclize.it"

COPY calculation.py /

RUN pip3 install requests
CMD python ./calculation.py
```

```python
# Content of the Python File

import os
import random

result = ((int(os.environ['ARG0']) + int(os.environ['ARG1'])) * int(os.environ['ARG2'])) / int(os.environ['ARG3'])

print(result)
```

#### Passing more than 5 Arguments

```javascript
pragma solidity ^0.4.18;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract Calculation is usingOraclize {

  event calculationResult(uint _result);
  event LogNewOraclizeQuery(string description);

  function Calculation() payable {
    oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);

    testCalculation("QmeSVrmYimykzzHq9gChwafjQj7DQTyqvkf6Sk92eY3pN3",
    "33", "9", "5", "2", "12", "2");
  }

  // (((NUMBER_1 + NUMBER_2) * MULTIPLIER) / DIVISOR) + NUMBER_3 - NUMBER_4 = 115

  function __callback(bytes32 myid, string result, bytes proof) {
    require (msg.sender == oraclize_cbAddress());
    calculationResult(parseInt(result));
  }

  function testCalculation(
    string _hash,
    string _number1,
    string _number2,
    string _multiplier,
    string _divisor,
    string _number3,
    string _number4) public payable {

    string[] memory numbers = new string[](7);
    numbers[0] = _hash;
    numbers[1] = _number1;
    numbers[2] = _number2;
    numbers[3] = _multiplier;
    numbers[4] = _divisor;
    numbers[5] = _number3;
    numbers[6] = _number4;

    sendCalculationQuery(numbers);
  }

  function sendCalculationQuery(string[] array) internal {
    if (oraclize.getPrice("computation") > this.balance) {
        LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
    } else {
        LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        oraclize_query("computation", array);
    }
  }
}
```

In case you need to pass more arguments, you will need to send a manually set dynamic string/bytes array, for example:

`string[] memory myArgs = new string[](6);`

`myArgs[0] = "MYIPFSHASH";`

`...`

`myArgs[5] = "LAST ARG";`

The query would then look like this: `oraclize_query("computation", myArgs)`


#### Passing Encrypted Arguments
```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ComputationTest is usingOraclize {

	event LogConstructorInitiated(string nextStep);
    event LogNewOraclizeQuery(string description);
    event LogNewResult(string result);

    function ComputationTest() payable {
        LogConstructorInitiated("Constructor was initiated. Call 'update()' to send the Oraclize Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) revert();
        LogNewResult(result);

    }

    function update() payable {
        LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        oraclize_query("nested", "[computation] ['QmaqMYPnmSHEgoWRMP3WSrUYsPWKjT85C81PgJa2SXBs8u', \
'Example of decrypted string', '${[decrypt] BOYnQstP700X10I+WWNUVVNZEmal+rZ0GD1CgcW5P5wUSFKr2QoIwHLvkHfQR5e4Bfakq0CIviJnjkfKFD+ZJzzxcaFUQITDZJxsRLtKuxvAuh6IccUJ+jDF/znTH+8x8EE1Tt9SY7RvqtVao2vxm4CxIWq1vk4=}', 'Hello there!']");
    }

}
```
Encrypted arguments can be passed using the nested and the decrypt meta data sources, as shown in the example at the right.

### Random Data Source

In the contract usingOraclize, which smart contracts should use to interface with Oraclize, some specific functions related to the Oraclize Random Data Source have been added. In particular:

* `oraclize_newRandomDSQuery`: helper to perform an Oraclize random DS query correctly
	* `oraclize_randomDS_setCommitment`: set in the smart contract storage the commitment for the current request
	* `oraclize_randomDS_getSessionPubKeyHash`: recovers the hash of a session pub key presents in the connector
* `oraclize_randomDS_proofVerify_main`: performs the verification of the proof returned with the callback transaction
	* `oraclize_randomDS_sessionKeyValidity`: verify that the session key chain of trust is valid and its root is a Ledger Root Key
	* `matchBytes32Prefix`: verify that the result returned is the sha256 of the session key signature over the request data payload

For advance usage of Random Data Source, it is recommended to read the following section.

<aside class="notice">
The random datasource is currently available on the Ethereum mainnet and on all Ethereum public testnets only (Rinkeby, Kovan, Ropsten-revival) - it is not integrated yet with private blockchains/testrpc/remix-ide-vm.
</aside>

#### Two Party Interactions
```javascript
    function oraclize_newRandomDSQuery(uint _delay, uint _nbytes, uint _customGasLimit) internal returns (bytes32){
        if ((_nbytes == 0)||(_nbytes > 32)) revert();
        bytes memory nbytes = new bytes(1);
        nbytes[0] = byte(_nbytes);
        bytes memory unonce = new bytes(32);
        bytes memory sessionKeyHash = new bytes(32);
        bytes32 sessionKeyHash_bytes32 = oraclize_randomDS_getSessionPubKeyHash();
        assembly {
            mstore(unonce, 0x20)
            mstore(add(unonce, 0x20), xor(blockhash(sub(number, 1)), xor(xor(caller,coinbase), xor(callvalue,timestamp)))
            mstore(sessionKeyHash, 0x20)
            mstore(add(sessionKeyHash, 0x20), sessionKeyHash_bytes32)
        }
        bytes[3] memory args = [unonce, nbytes, sessionKeyHash];
        bytes32 queryId = oraclize_query(_delay, "random", args, _customGasLimit);
        oraclize_randomDS_setCommitment(queryId, sha3(bytes8(_delay), args[1], sha256(args[0]), args[2]));
        return queryId;
    }

```

The `oraclize_newRandomDSQuery` can be used for different kind of interactions, but the security can be incresed further by additing additional commitment data to the request. For example, for two party interactions, the `oraclize_newRandomDSQuery` can be modified as showon the side to include the sender address and the value send along as commitment data. This more strongly commitment the request for random bytes to current party, which are assumed to have a stake in the contract, making it impossible for miners to replay transactions on potential forks or reorg of the current chain.

#### Multi-Party Interactions

In the case of multi-party interactions, such as voting schemes or lotteries, the commitment data can should include all participants addresses, to ensure that the transaction cannot be replayed by a miner on a fork or a reorged chain where a participant didn't put a stake.

### ERC20 Token Payments

```javascript

/**
 *
 * @dev Provable helper functions for managing ERC20 Payments
 *
 */

// Set payment method to token existing at <token-address>
oraclize_setCustomTokenPayment(address <token-address>);

// Approve an allowance of the token for the Provable service:
oraclize_approveTokenAllowance(
  address <token-address>,
  uint256 <token-amount>
);

// Or combine the above into a single call to this function:
oraclize_setAndApproveTokenAllowance(
 	address<token-address>,
	uint256<token-amount>
);

// Get the price of a query in tokens:
oraclize_getPriceERC20(uint256 <gas-limit>);

// Revert back to paying with ETH and revoke the approved token amount:
oraclize_unsetAndRevokeCustomPayment();

```

Provable supports ERC20 token payments. In order to make queries using a token as payment rather than ETH, you must first call `oraclize_setCustomTokenPayment(address <token-address>);` somewhere in your contract. The parameter `<token-address>` is any of those existing on the whitelist of supported tokens. (The token whitelist will be announced soon!)<!-- FIXME: Update link here when we have list! -->

Once the above is all set, the process of making queries is exactly the same as when using ETH, except you make your queries by calling: `oraclize_token_query(<params>)` instead. Query prices are exactly the same as when paying in ETH, but will be converted to their token equivalent automatically.

<aside class="notice">
Note that any calls to `oraclize_setCustomTokenPayment()` or `oraclize_getPriceERC20(...)'` that use a token-address not on the list of supported tokens will `revert();`.
</aside>

The same as when paying for queries with ETH, when paying with a token you will need to ensure your contract has a sufficient balance of that token to cover the query cost, and that a balance has been `approved` to be used by the Provable connector contract which it is calling. (See the ERC20 token __[specification here](https://theethereum.wiki/w/index.php/ERC20_Token_Standard#Approve_And_TransferFrom_Token_Balance)__ for more information on token approval.)

To make this simpler, the Provable API provides various helper functions which you can see on the right hand side.

<aside class="notice">
Notice in the helper functions the one that composes both `oraclize_setCustomTokenPayment` and `oraclize_approveTokenAllowance`. This composition (`oraclize_setAndApproveTokenAllowance(...);`) is ideal for using in your contract's constructor function to setup the token payments in a single function call upon deployment!
</aside>

Just as when __[paying for queries using ETH](http://docs.oraclize.it/#ethereum-best-practices-pre-calculating-the-query-price)__, when paying using a token it is also possible to pre-calculate a query-price via: `oraclize_getPriceERC20(<datasource>);`. This returns the next query price expressed in units of the token that the your contract has set as its `customTokenPayment`.

Additional parameters may be passed to get prices for more specific query types. See the information to the right for a full list of `oraclize_getPriceERC20` function overloads.

<aside class="notice">
Note that the first query to the Provable service is _free_, and so the first call to `oraclize_getPriceERC20` from any contract with a gas limit and/or gas price that is _less than or equal_ to the default values will result in the function _correctly_ returning `0`.
</aside>

In the case of a contract specifying a token payment, but sending enough ETH to cover the cost of the query, ETH will be used as payment rather than the token.

Should a contract wish to switch back to using ETH to pay for queries, rather than a token, it can do so by calling: `oraclize_unsetAndRevokeCustomPayment();`. This will unset the custom token payment option, and reset the allowance to the Provable contract to zero.

```javascript

/**
 *
 * @dev The complete set of oraclize_getPriceERC20() overloads follow,
 *      allowing for price discovery of any query type.
 *
 */

// For datasource prices...
oraclize_getPriceERC20(string _datasource);
oraclize_getPriceERC20(bytes1 _datasource);

// For prices involving custom gas limits...
oraclize_getPriceERC20(string _datasource, uint256 _gasLimit);
oraclize_getPriceERC20(bytes1 _datasource, uint256 _gasLimit);

// For query prices for addresses other than the calling contract...
oraclize_getPriceERC20(string _datasource, address _contractAddress);
oraclize_getPriceERC20(bytes1 _datasource, address _contractAddress);

// For query prices involving different contracts w/ custom gas limits...
oraclize_getPriceERC20(string _datasource, address _contractAddress, uint256 _gasLimit);
oraclize_getPriceERC20(bytes1 _datasource, address _contractAddress, uint256 _gasLimit);

// For prices involving custom gas limits and custom gas prices...
oraclize_getPriceERC20(string _datasource, uint256 _gasLimit, uint256 _gasPrice);
oraclize_getPriceERC20(bytes1 _datasource, uint256 _gasLimit, uint256 _gasPrice);

// For prices involving different _datasource & prooftype combinations...
oraclize_getPriceERC20(string _datasource, uint256 _gasLimit, uint256 _gasPrice, bytes1 _proofType);
oraclize_getPriceERC20(bytes1 _datasource, uint256 _gasLimit, uint256 _gasPrice, bytes1 _proofType);

/**
 *
 * @dev Or have the same set of oraclize_getPriceERC20 overloads but which
 *      can be used for getting prices in *any* token, rather than only that
 *      which your contract has elected to use.
 *
 */

// For datasource prices in given token's units...
oraclize_getPriceERC20(address _tokenAddress, string _datasource)
oraclize_getPriceERC20(address _tokenAddress, bytes1 _datasource)

// For prices in the given token's units & involving custom gas limits...
oraclize_getPriceERC20(string _datasource, uint256 _gasLimit, address _tokenAddress)
oraclize_getPriceERC20(bytes1 _datasource, uint256 _gasLimit, address _tokenAddress)

// For query prices in the given token's units & for addresses other than the calling contract...
oraclize_getPriceERC20(string _datasource, address _contractAddress, address _tokenAddress)
oraclize_getPriceERC20(bytes1 _datasource, address _contractAddress, address _tokenAddress)

// For prices in the given token's units & involving different contracts w/ custom gas limits...
oraclize_getPriceERC20(string _datasource, address _contractAddress, uint256 _gasLimit, address _tokenAddress)
oraclize_getPriceERC20(bytes1 _datasource, address _contractAddress, uint256 _gasLimit, address _tokenAddress)

// For prices in a given token's units & involving different datasource & prooftype combinations...
oraclize_getPriceERC20(string _datasource, uint256 _gasLimit, uint256 _gasPrice, address _tokenAddress)
oraclize_getPriceERC20(bytes1 _datasource, uint256 _gasLimit, uint256 _gasPrice, address _tokenAddress)

// For prices in a given token's units & involving different datasource & prooftype combinations...
oraclize_getPriceERC20(string _datasource, uint256 _gasLimit, uint256 _gasPrice, byte _proofType, address _tokenAddress)
oraclize_getPriceERC20(bytes1 _datasource, uint256 _gasLimit, uint256 _gasPrice, byte _proofType, address _tokenAddress)

```

### ProofShield

The Oraclize *ProofShield* is a concept first introduct at Devcon4, you can watch our presentation about "Scalable Onchain Verification for Authenticated Data Feeds and Offchain Computations" [here](https://www.youtube.com/watch?v=7uQdEBVu8Sk).

<aside class="notice">
The ProofShield is still EXPERIMENTAL, please DO NOT use it in production (yet). A production-ready version will follow in the future.
</aside>

The ProofShield enables smart contracts to verify on-chain the authenticity proofs provided by Oraclize, this ensures that the authenticity of the data received is verified before going ahead and using the data.

To enable the ProofShield it is enough to set it via the `oraclize_setProof` function like you see in the following code: `oraclize_setProof(proofType_Android_v2 | proofShield_Ledger);`

Once the ProofShield is enabled, the received proof will not be the raw Authenticity Proof, but the ProofShield proof instead: some functions are provided so that the ProofShield proof can be verified on-chain. In order to verify it, you need to call from within the `__callback` method the function `oraclize_proofShield_proofVerify__returnCode(queryId, result, proof)` and ensure that it returns 0.

<aside class="notice">
The ProofShield is currently available on all Ethereum public testnets only (Rinkeby, Kovan, Ropsten-revival) - it is not integrated yet with private blockchains/testrpc/remix-ide-vm.
</aside>

A code example follows, note that the complete version of it is available [here](https://github.com/oraclize/ethereum-examples/blob/master/solidity/proofshield/proofShieldExample.sol):

```javascript
contract proofShieldExample is usingOraclize {

	event LogConstructorInitiated(string nextStep);
    event LogNewAuthenticatedResult(string);

    function proofShieldExample() payable {
        oraclize_setProof(proofType_Android_v2 | proofShield_Ledger);
        LogConstructorInitiated("Constructor was initiated. Call 'sendQuery()' to send the Oraclize Query.");
    }

    function __callback(bytes32 queryId, string result, bytes proof) {
        if (msg.sender != oraclize_cbAddress()) revert();

        if (oraclize_proofShield_proofVerify__returnCode(queryId, result, proof) != 0) {
            // the proof verification has failed, do we need to take any action here? (depends on the use case)
        } else {
            // the proof verification has passed
            // now that we know that the random number was safely generated, let's use it..

            LogNewAuthenticatedResult(result);
        }
    }

    function sendQuery() payable {
        string memory query = "json(https://www.bitstamp.net/api/v2/ticker/ethusd/).last";
        bytes32 queryId = oraclize_query("URL", query);

        oraclize_proofShield_commitment[queryId] = keccak256(sha256(query), proofType_Android_v2);
    }

}
```

### Byte Datasources

As a more advanced feature, Provable are providing all datasource `strings` as type `bytes1` as well as `strings`. The strings remain more readable (`URL`, `Random` and so on…) in Provable queries, but as with any string-related manipulation in Solidity, using them costs more gas-wise.  As such, by offering the same set of datasources as a `bytes1` equivalent, advanced users may choose to declare their datasource in this manner instead and thus benefit from cheaper query gas-costs.

<aside class="notice">
All of Provable's API functions where a `string _datasource` parameter is used can have the parameter substituted for its `bytes1` equivalent without altering the behaviour of the function in any way. See the section on the right for the `string -> bytes1` datasource conversion dictionary.
</aside>

``` javascript

// Datasource strings and their `bytes1` equivalents:

|---------------------------|
|       `string` | `bytes1` |
|---------------------------|
|        'swarm' |   0xF8   |
|   'Blockchain' |   0xF9   |
|       'nested' |   0xFA   |
|         'IPFS' |   0xFB   |
| 'WolframAlpha' |   0xFC   |
|  'computation' |   0xFD   |
|       'Random' |   0xFE   |
|          'URL' |   0xFF   |
|---------------------------|


```

### More Examples
More complete, complex examples are available on the dedicated Github repository: <a href="https://github.com/oraclize/ethereum-examples" target="_blank">https://github.com/oraclize/ethereum-examples</a>
