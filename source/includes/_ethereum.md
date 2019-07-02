# <a style="display:inline-block; min-width:20px">&#9830;</a> Ethereum

The following section is dedicated to the Ethereum and Provable integration.
To better profit from this section of the documentation, previous knowledge of Solidity and Ethereum is required.

The interaction between Provable and an Ethereum smart contract is asynchronous. Any request for data is composed of two steps:

* Firstly, in the most common case, a transaction executing a function of a smart contract is broadcasted by a user. The function contains a special instruction which manifest to Provable, who is constantly monitoring the Ethereum blockchain for such instruction, a request for data.
* Secondly, according to the parameters of such request, Provable will fetch or compute a result, build, sign and broadcast the transaction carrying the result. In the default configuration, such transaction will execute the `__callback` function which should be placed in the smart contract by its developer: for this reason, this transaction is referred in the documentation as the Provable callback transaction.

As said in previous sections, one of the fundamental characteristics of Provable is the capability of returning data to a smart contract together with one or more proofs of authenticity of the data. The generation of an authenticity proof is optional and it is a contract-wide setting which must be configured by the smart contract developer before the request for data is initiated. Provable always recommends the use of authenticity proofs for production deployments.

## Quick Start

```javascript
pragma solidity ^0.4.11;
import "github.com/provable-things/ethereum-api/provableAPI.sol";

contract ExampleContract is usingProvable {

   string public ETHUSD;
   event LogConstructorInitiated(string nextStep);
   event LogPriceUpdated(string price);
   event LogNewProvableQuery(string description);

   function ExampleContract() payable {
       LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Provable Query.");
   }

   function __callback(bytes32 myid, string result) {
       if (msg.sender != provable_cbAddress()) revert();
       ETHUSD = result;
       LogPriceUpdated(result);
   }

   function updatePrice() payable {
       if (provable_getPrice("URL") > this.balance) {
           LogNewProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee");
       } else {
           LogNewProvableQuery("Provable query was sent, standing by for the answer..");
           provable_query("URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
       }
   }
}
```

The most simple way to introduce the Ethereum - Provable integration, it is by showing a working example, such as the smart contract on the right.
This contract uses Provable to fetch the last ETH/USD from Coinbase Pro APIs. The update process is initiated every time the function updatePrice() is called. The example shows two important components of using Provable:

* The contract should be a child of the contract usingProvable
* The contract usingProvable is defined in the provableAPI file, which can be fetched from the dedicated Provable Github repository.

The code in the example is working out of the box if Remix is used to compile and deploy it on any of the Ethereum networks: main-net and the Ropsten, Kovan and Rinkeby testnets. If, instead, another tool is used, it will be necessary to replace the import statement with a local import of the provableAPI.sol file since direct import from Github may not be supported.

To ease development, Provable doesn't charge a contract for its first request of data done using the default gas parameters. Successive requests will require the contract to pay the Provable fee and the ether necessary to pay for the callback transaction. Both are automatically taken from the contract balance. If the contract doesn't have enough funds in his balance, the request will fail and Provable won't return any data.

<aside class="notice">
Only the first query is free. Ensure that the contract has a sufficient ETH balance to pay the following queries. The contract gets automatically charged on the `provable_query` call but fails if the balance is insufficient.
</aside>


### Simple Query
```javascript
// This code example will ask Provable to send as soon as possible
// a transaction with the primary result (as a string) of the given
// formula ("random number between 0 and 100") fetched from the
// data-source "WolframAlpha".
provable_query("WolframAlpha", "random number between 0 and 100");

provable_query("URL", "https://api.kraken.com/0/public/Ticker?pair=ETHXBT")

provable_query("URL",
  "json(https://www.therocktrading.com/api/ticker/BTCEUR).result.0.last")

provable_query("IPFS", "QmdEJwJG1T9rzHvBD8i69HHuJaRgXRKEQCP7Bh1BVttZbU")

// The URL datasource also supports a supplement argument, useful for creating HTTP POST requests.
// If that argument is a valid JSON string, it will be automatically sent as JSON.
provable_query("URL", "json(https://shapeshift.io/sendamount).success.deposit",
  '{"pair":"eth_btc","amount":"1","withdrawal":"1AAcCo21EUc1jbocjssSQDzLna9Vem2UN5"}')
```
A request for data is called **query**. The `provable_query` is a function, inhered from the parent usingProvable contract, which expects at least two arguments:

* A data-source such as `URL`, `WolframAlpha`, `IPFS`, 'Swarm' and others listed here
* The argument for the given data-source. For examples:
 * the full `URL`, which may inclued the use of JSON or XML parsing helpers as it can be seen in the previous example
 * or a `WolframAlpha` formula
 * or an `IPFS` multihash

The number and type of supported arguments depends from the data-source in use. Beside, few more code example will be shown and commented. The datasource, as well as the authenticity proof chosen, determine the fee which the contract has to pay to Provable.


### Schedule a Query in the Future

```javascript
// Relative time: get the result from the given URL 60 seconds from now
provable_query(60, "URL",
  "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0")

// Absolute time: get the result from the given datasource at the specified UTC timestamp in the future
provable_query(scheduled_arrivaltime+3*3600,
  "WolframAlpha", strConcat("flight ", flight_number, " landed"));
```
The execution of a query can be scheduled in a future date. The function `provable_query` accepts as a parameter the delay in seconds from the current time or the timestamp in the future as first argument.
Please note that in order for the future timestamp to be accepted by Provable it must be within **60 days** of the current UTC time in the case of the absolute timestamp choice, or in the case of a relative time elapse, the elapsed seconds must equate to no more than **60 days**.

### Recursive Queries
```javascript
pragma solidity ^0.4.11;
import "github.com/provable-things/ethereum-api/provableAPI.sol";

contract ExampleContract is usingProvable {

    string public ETHUSD;
	event LogConstructorInitiated(string nextStep);
	event LogPriceUpdated(string price);
	event LogNewProvableQuery(string description);

    function ExampleContract() payable {
        LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Provable Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != provable_cbAddress()) revert();
        ETHUSD = result;
		LogPriceUpdated(result);
		updatePrice();
    }

 	function updatePrice() payable {
        if (provable_getPrice("URL") > this.balance) {
            LogNewProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee");
        } else {
           	LogNewProvableQuery("Provable query was sent, standing by for the answer..");
        	provable_query(60, "URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
        }
    }

```
Smart contracts using Provable can be effectively autonomous by implementing a new call to Provable into their  ` __callback` method.
This can be useful for implementing periodic updates of some on-chain reference data, as with price feeds, or to periodically check for some off-chain conditions.

This modified version of the previous example will update the ETH/USD exchange rate every 60 seconds, until the contract has enough funds to pay for the Provable fee.

<aside class="notice">
Use recursive queries cautiously. In general it is recommended to send queries purposefully.
</aside>

### The Query ID
```javascript
pragma solidity ^0.4.11;
import "github.com/provable-things/ethereum-api/provableAPI.sol";

contract ExampleContract is usingProvable {

    string public ETHUSD;
	mapping(bytes32=>bool) validIds;
	event LogConstructorInitiated(string nextStep);
	event LogPriceUpdated(string price);
    event LogNewProvableQuery(string description);

    function ExampleContract() payable {
        LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Provable Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (!validIds[myid]) revert();
		if (msg.sender != provable_cbAddress()) revert();
        ETHUSD = result;
		LogPriceUpdated(result);
		delete validIds[myid];
		updatePrice();
    }

 	function updatePrice() payable {
        if (provable_getPrice("URL") > this.balance) {
            LogNewProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee");
        } else {
           	LogNewProvableQuery("Provable query was sent, standing by for the answer..");
			bytes32 queryId =
				provable_query(60, "URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
			validIds[queryId] = true;
        }
    }
}
```

Every time the function `provable_query` is called, it returns a unique ID, hereby referred to as `queryId`, which depends from the number of previous requests and the address of smart contract.
The queryId identifies a specific query done to Provable and it is returned to the contract as a parameter of the callback transaction.

Provable recommends smart contract developers to verify if the queryId sent by the callback transaction was generated by a valid call to the `provable_query` function, as shown in the example accompanying this paragraph. This ensures that each query response is processed only once and helps avoid misuse of the smart contract logic. Moreover, it protects the smart contract during blockchain reorganizations, as explained in the dedicated paragraph of this section.

The `queryId` can be used as well to implement different behaviors into the `__callback` function, in particular when there is more than one pending call from Provable.

### Custom Gas Limit and Gas Price
```javascript
pragma solidity ^0.4.11;
import "github.com/provable-things/ethereum-api/provableAPI.sol";

contract ExampleContract is usingProvable {

    string public ETHUSD;
	mapping(bytes32=>bool) validIds;
	event LogConstructorInitiated(string nextStep);
	event LogPriceUpdated(string price);
  event LogNewProvableQuery(string description);

	// This example requires funds to be send along with the contract deployment
	// transaction
    function ExampleContract() payable {
        provable_setCustomGasPrice(4000000000);
		LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Provable Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (!validIds[myid]) revert();
		if (msg.sender != provable_cbAddress()) revert();
        ETHUSD = result;
		LogPriceUpdated(result);
		delete validIds[myid];
		updatePrice();
    }

 	function updatePrice() payable {
        if (provable_getPrice("URL") > this.balance) {
          LogNewProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee");
        } else {
          LogNewProvableQuery("Provable query was sent, standing by for the answer..");
			bytes32 queryId =
				provable_query(60, "URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price", 500000);
			validIds[queryId] = true;
        }
    }
}
```

The transaction originating from Provable to the  `__callback` function pays a fee to the miner which include the transaction in a block, just like any other transaction. The miner fee is paid in Ether and it is calculated by taking the amount of gas which covers the execution costs of the transaction multiplied by the selected gas/ether price. Provable will set those parameters accordingly to the parameters specified in the smart contract, for contract-wide settings, and in the `provable_query` function, for query-specific settings. The miner fee for the callback transaction is taken from the contract balance when the query transaction is executed.

If no settings are specified, Provable will use the default values of 200,000 gas and 20 GWei. This last value is on the higher-end of the pricing spectrum right now, but it helps having faster confirmation times during network-wide congestions.

A different value for the Provable callback gas can be passed as the argument `_gasLimit` to the `provable_query` function as shown in the following examples.

```javascript
// If the callback transaction requires little gas, the value can be lowered:
provable_query("URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price", 100000);

// Callback methods may be expensive. The example requires the JSON parsing
// a string in the smart contract. If that's the case, the gas should be increased:
provable_query("URL", "https://api.pro.coinbase.com/products/ETH-USD/ticker", 500000);
```

The gas price of the callback transaction can be set by calling the `provable_setCustomGasPrice` function, either in the constructor, which is executed once at deployment of the smart contract, or in a separate function. The following is the ExampleContract modified to specify a custom gas price of 4 Gwei and a custom gas limit for the callback transaction.

Smart contract developers should estimate correctly and minimize the cost of their `__callback` method, as any unspent gas will be returned to Provable and no refund is available.

<aside class="notice">
When calling `provable_setCustomGasPrice` the parameter type is uint and represents the amount of wei. However, there is no need to put `wei` keyword in the parameter.
</aside>


### Authenticity Proofs

```javascript
pragma solidity ^0.4.11;
import "github.com/provable-things/ethereum-api/provableAPI.sol";

contract ExampleContract is usingProvable {

    string public ETHUSD;
	mapping(bytes32=>bool) validIds;
	event LogConstructorInitiated(string nextStep);
	event LogPriceUpdated(string price);
	event LogNewProvableQuery(string description);


	// This example requires funds to be send along with the contract deployment
	// transaction
	function ExampleContract() payable {
        provable_setCustomGasPrice(4000000000);
		provable_setProof(proofType_TLSNotary | proofStorage_IPFS);
		LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Provable Query.");
    }

    function __callback(bytes32 myid, string result, bytes proof) {
        if (!validIds[myid]) revert();
		if (msg.sender != provable_cbAddress()) revert();
        ETHUSD = result;
		LogPriceUpdated(result);
		delete validIds[myid];
		updatePrice();
    }

 	function updatePrice() payable {
        if (provable_getPrice("URL") > this.balance) {
          LogNewProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee");
        } else {
          LogNewProvableQuery("Provable query was sent, standing by for the answer..");
          bytes32 queryId =
            provable_query(60, "URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price", 500000);
  validIds[queryId] = true;
    }
}
}
```
Authenticity proofs are at the core of Provable's oracle model. Smart contracts can request authenticity proofs together with their data by calling the `provable_setProof` function available in the usingProvable contract. The authenticity proof can be either delivered directly to the smart contract or it can be saved, uploaded and stored on some alternate storage medium like <a href="http://ipfs.io/" target="_blank">IPFS</a>.

When a smart contract requests for an authenticity proof, it **must** define a different callback function with the following arguments: `function __callback(bytes32 queryId, string result, bytes proof)`

The `provable_setProof` function expects the following format: `provable_setProof(proofType_ | proofStorage_ )`

Both proofType and proofStorage are byte constants defined in usingProvable:

Available parameters for proofTypes are:

* `proofType_NONE`: the default value of any smart contracts
* `proofType_TLSNotary`: available only on the *Ethereum Mainnet*
* `proofType_Android`
* `proofType_Native`
* `proofType_Ledger`

While for proofStorage:

* `proofStorage_IPFS`

For example, `provable_setProof(proofType_TLSNotary)` will return the full TLSNotary Proof bytes as the proof argument in the callback transaction. If instead `provable_setProof(proofType_TLSNotary | proofStorage_IPFS)` is used, then Provable will return only the base58-decoded IPFS multihash as the proof argument. To obtain the IPFS multihash, the bytes must be encoded to base58.
The method `provable_setProof` can be executed in the constructor, becoming a contract-wide lasting setting, or it can be set directly before a specific query is to be made. Authenticity proofs can be disabled by calling `provable_setProof(proofType_NONE)`. Smart contract developer should be aware that the helper method `provable_setProof` is an internal function of usingProvable, and therefore it must be included specifically in their smart contract at compile time, before deployment.
The following builds on our previous example:


### Verifiability

Supported proofs can be verified. The following tools can be used: <a href="#development-tools-network-monitor">Verification Tools</a>


## Best Practices

### Precalculating the Query Price

```javascript
pragma solidity ^0.4.0;
import "github.com/provable-things/ethereum-api/provableAPI.sol";

contract KrakenPriceTicker is usingProvable {

    string public ETHXBT;
    uint constant CUSTOM_GASLIMIT = 150000;

    event LogConstructorInitiated(string nextStep);
    event newProvableQuery(string description);
    event newKrakenPriceTicker(string price);


    function KrakenPriceTicker() {
        provable_setProof(proofType_TLSNotary | proofStorage_IPFS);
        LogConstructorInitiated("Constructor was initiated. Call 'update()' to send the Provable Query.");
    }

    function __callback(bytes32 myid, string result, bytes proof) {
        if (msg.sender != provable_cbAddress()) revert();
        ETHXBT = result;
        newKrakenPriceTicker(ETHXBT);
    }

    function update() payable {
        if (provable_getPrice("URL", CUSTOM_GASLIMIT) > this.balance) {
            newProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            newProvableQuery("Provable query was sent, standing by for the answer..");
            provable_query("URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0", CUSTOM_GASLIMIT);
        }
    }
}

```

You have to consider that your account will be debited for most of your Provable calls. If your contract is not covered with enough ETH, the query will fail. Depending on your contract logic you may want to check the price for your next query before it gets send. You can do this by calling `provable_getPrice` and check if it is higher than your current contract balance. If that's the case the `provable_query` will fail and you may want to handle it gracefully. You can also add a gaslimit parameter to the `provable_getPrice` function: `provable_getPrice(string datasource, uint gaslimit)`. Make sure that the custom gaslimit for `provable_getPrice` matches with the one you will use for `provable_query`.


### Mapping Query Ids

```javascript
pragma solidity ^0.4.11;
import "github.com/provable-things/ethereum-api/provableAPI.sol";

contract ExampleContract is usingProvable {

    string public ETHUSD;
    event LogConstructorInitiated(string nextStep);
    event LogPriceUpdated(string price);
    event LogNewProvableQuery(string description);

    mapping (bytes32 => bool) public pendingQueries;

    function ExampleContract() payable {
        LogConstructorInitiated("Constructor was initiated. Call 'updatePrice()' to send the Provable Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != provable_cbAddress()) revert();
        require (pendingQueries[myid] == true);
        ETHUSD = result;
        LogPriceUpdated(result);
        delete pendingQueries[myid]; // This effectively marks the query id as processed.
    }

    function updatePrice() payable {
        if (provable_getPrice("URL") > this.balance) {
          LogNewProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee");
        } else {
          LogNewProvableQuery("Provable query was sent, standing by for the answer..");
          bytes32 queryId = provable_query("URL", "json(https://api.pro.coinbase.com/products/ETH-USD/ticker).price");
          pendingQueries[queryId] = true;
        }
    }
}
```

It might occur that a callback function of a sent query gets called more than once. Therefore it might be helpful to initiate a mapping that manages the query ids and their states. When the callback function of a query gets called, the require statement checks if the current query id needs to be processed. After one successful iteration the id gets deleted to prevent further callbacks for that particular id.


## Advanced Topics

### Encrypted Queries
Certain contexts, such as smart contracts on public blockchains, might require a level of privacy to protect data from public scrutiny. Developers can make encrypted Provable queries by encrypting a part (or all) of a query with the Provable public key.
The encrypted queries feature may be of interested to developers who want to deploy their blockchain applications of public networks. For example, if an application leverages data from an authenticated API, it would be dangerous to disclose the API key to anyway who is monitoring the public chain.

Provable therefore offers the possibility of encrypting the parameters contained in a query to Provable's public key: `044992e9473b7d90ca54d2886c7addd14a61109af202f1c95e218b0c99eb060c7134c4ae46345d0383ac996185762f04997d6fd6c393c86e4325c469741e64eca9`
Only Provable will then be able to decrypt the request using its paired private key.

To encrypt the query, Provable provides a CLI tool, which can be found <a href="https://github.com/provable-things/encrypted-queries" target="_blank">here</a>. Alternatively,
The CLI command to encrypt an arbitrary string of text is then:

`python encrypted_queries_tools.py -e -p 044992e9473b7d90ca54d2886c7addd14a61109af202f1c95e218b0c99eb060c7134c4ae46345d0383ac996185762f04997d6fd6c393c86e4325c469741e64eca9 "YOUR QUERY"`

This will encrypt the query with the default Provable public key. The encrypted string can then be used as an argument for an Provable query.

```javascript
// In this example, the entire first argument of an provable_query has been encrypted.
// The actual string encrypted is:  json(https://poloniex.com/public?command=returnTicker).BTC_ETH.last
provable_query("URL","AzK149Vj4z65WphbBPiuWQ2PStTINeVp5sS9PSwqZi8NsjQy6jJLH765qQu3U/
  bZPNeEB/bYZJYBivwmmREXTGjmKJk/62ikcO6mIMQfB5jBVVUOqzzZ/A8ecWR2nOLv0CKkkkFzBYp2sW1H
  31GI+SQzWV9q64WdqZsAa4gXqHb6jmLkVFjOGI0JvrA/Zh6T5lyeLPSmaslI");
```

<aside class="notice">
You could also encrypt only 1 parameter of provable_query(), leaving the other ones in cleartext.
</aside>

The encryption method is also available for POST requests: you can encrypt both the URL and the POST data field as in the following example:

```javascript
// This is the query that we want to encrypt
provable_query("URL","json(https://api.postcodes.io/postcodes).status",
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
// to the provable_query (in the right order)
provable_query("BEIGVzv6fJcFiYQNZF8ArHnvNMAsAWBz8Zwl0YCsy4K/RJTN8ERHfBWtSfYHt+
  uegdD1wtXTkP30sTW+3xR3w/un1i3caSO0Rfa+wmIMmNHt4aOS","BNKdFtmfmazLLR/bfey4mP8
  v/R5zCIUK7obcUrF2d6CWUMvKKUorQqYZNu1YfRZsGlp/F96CAQhSGomJC7oJa3PktwoW5J1Oti/
  y2v4+b5+vN8yLIj1trS7p1l341Jf66AjaxnoFPplwLqE=", "BF5u1td9ugoacDabyfVzoTxPBxG
  NtmXuGV7AFcO1GLmXkXIKlBcAcelvaTKIbmaA6lXwZCJCSeWDHJOirHiEl1LtR8lCt+1ISttWuvp
  J6sPx3Y/QxTajYzxZfQb6nCGkv+8cczX0PrqKKwOn/Elf9kpQQCXeMglunT09H2B4HfRs7uuI");
```

You can also do this with a request to another datasource like WolframAlpha, the Bitcoin blockchain, or IPFS. Our encryption system also permits users to encrypt any of the supported datasource options.

<aside class="notice">
In order to prevent other users from using your exact encrypted query ("replay attacks"), the first contract querying Provable with a given encrypted query becomes its rightful "owner". Any other contract using that exact same string will receive an empty result.

As a consequence, remember to always generate a new encrypted string when re-deploying contracts using encrypted queries.
</aside>

<aside class="notice">
The security guarantee mentioned above is only valid on the mainnet, not on the testnet. For more information get in touch with info@provable.xyz
</aside>

To protect the plaintext queries, an Elliptic Curve Integrated Encryption Scheme was chosen. The steps performed for the encryption are the following ones:

* An Elliptic Curve Diffie-Hellman Key Exchange (ECDH), which uses secp256k1 as the curve and ANSI X9.63 with SHA256 as the Key Derivation Function. This algorithm is used to derive a shared secret from the Provable public key and ad-hoc, randomly generated developer private key.
* The shared secret is used by an AES-256 in Galois Counter Mode (GCM), an authenticated symmetric cipher, to encrypt the query string. The authentication tag is 16-bytes of length and the IV is chosen to be '000000000000' (96 bits of length). The IV can be set to the zero byte-array because each shared secret is meant to be a single-use throw-away. Every time the encryption function is called a new developer private key is re-generated. The final ciphertext is the concatenation of the encoded point (i.e the public key of the developer), the authentication tag and the encrypted text.

### Computation Data Source

#### Passing Arguments to the Package
```javascript
pragma solidity ^0.4.18;
import "github.com/provable-things/ethereum-api/provableAPI.sol";

contract Calculation is usingProvable {

    string NUMBER_1 = "33";
    string NUMBER_2 = "9";
    string MULTIPLIER = "5";
    string DIVISOR = "2";

    event LogNewProvableQuery(string description);
    event calculationResult(uint _result);

    // General Calculation: ((NUMBER_1 + NUMBER_2) * MULTIPLIER) / DIVISOR

    function Calculation() {
        provable_setProof(proofType_TLSNotary | proofStorage_IPFS);
    }

    function __callback(bytes32 myid, string result, bytes proof) {
        require (msg.sender == provable_cbAddress());
        calculationResult(parseInt(result));
    }

    function testCalculation() payable {
        sendCalculationQuery(NUMBER_1, NUMBER_2, MULTIPLIER, DIVISOR); // = 105
    }

    function sendCalculationQuery(string _NUMBER1, string _NUMBER2, string _MULTIPLIER, string _DIVISOR) payable {
        if (provable.getPrice("computation") > this.balance) {
          LogNewProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee");
        } else {
          LogNewProvableQuery("Provable query was sent, standing by for the answer..");
          provable_query("computation",["QmZRjkL4U72XFXTY8MVcchpZciHAwnTem51AApSj6Z2byR",
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
`provable_query("computation",["QmZRjkL4U72XFXTY8MVcchpZciHAwnTem51AApSj6Z2byR", _firstOperand, _secondOperand, _thirdOperand, _fourthOperand]);`

```shell
# Content of the Dockerfile

FROM frolvlad/alpine-python3
MAINTAINER Provable "info@provable.xyz"

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
import "github.com/provable-things/ethereum-api/provableAPI.sol";

contract Calculation is usingProvable {

  event calculationResult(uint _result);
  event LogNewProvableQuery(string description);

  function Calculation() payable {
    provable_setProof(proofType_TLSNotary | proofStorage_IPFS);

    testCalculation("QmeSVrmYimykzzHq9gChwafjQj7DQTyqvkf6Sk92eY3pN3",
    "33", "9", "5", "2", "12", "2");
  }

  // (((NUMBER_1 + NUMBER_2) * MULTIPLIER) / DIVISOR) + NUMBER_3 - NUMBER_4 = 115

  function __callback(bytes32 myid, string result, bytes proof) {
    require (msg.sender == provable_cbAddress());
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
    if (provable.getPrice("computation") > this.balance) {
      LogNewProvableQuery("Provable query was NOT sent, please add some ETH to cover for the query fee");
    } else {
      LogNewProvableQuery("Provable query was sent, standing by for the answer..");
      provable_query("computation", array);
    }
  }
}
```

In case you need to pass more arguments, you will need to send a manually set dynamic string/bytes array, for example:

`string[] memory myArgs = new string[](6);`

`myArgs[0] = "MYIPFSHASH";`

`...`

`myArgs[5] = "LAST ARG";`

The query would then look like this: `provable_query("computation", myArgs)`


#### Passing Encrypted Arguments

```javascript
pragma solidity ^0.4.11;
import "github.com/provable-things/ethereum-api/provableAPI.sol";

contract ComputationTest is usingProvable {

	event LogConstructorInitiated(string nextStep);
    event LogNewProvableQuery(string description);
    event LogNewResult(string result);

    function ComputationTest() payable {
        LogConstructorInitiated("Constructor was initiated. Call 'update()' to send the Provable Query.");
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != provable_cbAddress()) revert();
        LogNewResult(result);

    }

    function update() payable {
      LogNewProvableQuery("Provable query was sent, standing by for the answer..");
      provable_query("nested", "[computation] ['QmaqMYPnmSHEgoWRMP3WSrUYsPWKjT85C81PgJa2SXBs8u', \
          'Example of decrypted string', '${[decrypt] BOYnQstP700X10I+WWNUVVNZEmal+rZ0GD1CgcW5P5wUSFKr2QoIwHLvkHfQR5e4Bfakq0CIviJnjkfKFD+ZJzzxcaFUQITDZJxsRLtKuxvAuh6IccUJ+jDF/znTH+8x8EE1Tt9SY7RvqtVao2vxm4CxIWq1vk4=}', 'Hello there!']");
    }

}
```
Encrypted arguments can be passed using the nested and the decrypt meta data sources, as shown in the example at the right.

### Random Data Source

In the contract usingProvable, which smart contracts should use to interface with Provable, some specific functions related to the Provable Random Data Source have been added. In particular:

* `provable_newRandomDSQuery`: helper to perform an Provable random DS query correctly
	* `provable_randomDS_setCommitment`: set in the smart contract storage the commitment for the current request
	* `provable_randomDS_getSessionPubKeyHash`: recovers the hash of a session pub key presents in the connector
* `provable_randomDS_proofVerify_main`: performs the verification of the proof returned with the callback transaction
	* `provable_randomDS_sessionKeyValidity`: verify that the session key chain of trust is valid and its root is a Ledger Root Key
	* `matchBytes32Prefix`: verify that the result returned is the sha256 of the session key signature over the request data payload

For advance usage of Random Data Source, it is recommended to read the following section.

<aside class="notice">
The random datasource is currently available on the Ethereum mainnet and on all Ethereum public testnets only (Rinkeby, Kovan, Ropsten-revival) - it is not integrated yet with private blockchains/testrpc/remix-ide-vm.
</aside>

#### Two Party Interactions
```javascript
    function provable_newRandomDSQuery(uint _delay, uint _nbytes, uint _customGasLimit) internal returns (bytes32){
        if ((_nbytes == 0)||(_nbytes > 32)) revert();
        bytes memory nbytes = new bytes(1);
        nbytes[0] = byte(_nbytes);
        bytes memory unonce = new bytes(32);
        bytes memory sessionKeyHash = new bytes(32);
        bytes32 sessionKeyHash_bytes32 = provable_randomDS_getSessionPubKeyHash();
        assembly {
            mstore(unonce, 0x20)
            mstore(add(unonce, 0x20), xor(blockhash(sub(number, 1)), xor(xor(caller,coinbase), xor(callvalue,timestamp)))
            mstore(sessionKeyHash, 0x20)
            mstore(add(sessionKeyHash, 0x20), sessionKeyHash_bytes32)
        }
        bytes[3] memory args = [unonce, nbytes, sessionKeyHash];
        bytes32 queryId = provable_query(_delay, "random", args, _customGasLimit);
        provable_randomDS_setCommitment(queryId, sha3(bytes8(_delay), args[1], sha256(args[0]), args[2]));
        return queryId;
    }

```

The `provable_newRandomDSQuery` can be used for different kind of interactions, but the security can be incresed further by additing additional commitment data to the request. For example, for two party interactions, the `provable_newRandomDSQuery` can be modified as showon the side to include the sender address and the value send along as commitment data. This more strongly commitment the request for random bytes to current party, which are assumed to have a stake in the contract, making it impossible for miners to replay transactions on potential forks or reorg of the current chain.

#### Multi-Party Interactions
In the case of multi-party interactions, such as voting schemes or lotteries, the commitment data can should include all participants addresses, to ensure that the transaction cannot be replayed by a miner on a fork or a reorged chain where a participant didn't put a stake.



### ProofShield

The Provable *ProofShield* is a concept first introduct at Devcon4, you can watch our presentation about "Scalable Onchain Verification for Authenticated Data Feeds and Offchain Computations" [here](https://www.youtube.com/watch?v=7uQdEBVu8Sk).

<aside class="notice">
The ProofShield is still EXPERIMENTAL, please DO NOT use it in production (yet). A production-ready version will follow in the future.
</aside>

The ProofShield enables smart contracts to verify on-chain the authenticity proofs provided by Provable, this ensures that the authenticity of the data received is verified before going ahead and using the data.


To enable the ProofShield it is enough to set it via the `provable_setProof` function like you see in the following code:


```javascript

    provable_setProof(proofType_Android_v2 | proofShield_Ledger);

````


Once the ProofShield is enabled, the received proof will not be the raw Authenticity Proof, but the ProofShield proof instead: some functions are provided so that the ProofShield proof can be verified on-chain. In order to verify it, you need to call from within the `__callback` method the function `provable_proofShield_proofVerify__returnCode(queryId, result, proof)` and ensure that it returns 0.

<aside class="notice">
The ProofShield is currently available on all Ethereum public testnets only (Rinkeby, Kovan, Ropsten-revival) - it is not integrated yet with private blockchains/testrpc/remix-ide-vm.
</aside>

A code example follows, note that the complete version of it is available [here](https://github.com/provable-things/ethereum-examples/blob/master/solidity/proofshield/proofShieldExample.sol):

```javascript
contract proofShieldExample is usingProvable {

	event LogConstructorInitiated(string nextStep);
    event LogNewAuthenticatedResult(string);

    function proofShieldExample() payable {
        provable_setProof(proofType_Android_v2 | proofShield_Ledger);
        LogConstructorInitiated("Constructor was initiated. Call 'sendQuery()' to send the Provable Query.");
    }

    function __callback(bytes32 queryId, string result, bytes proof) {
        if (msg.sender != provable_cbAddress()) revert();

        if (provable_proofShield_proofVerify__returnCode(queryId, result, proof) != 0) {
            // the proof verification has failed, do we need to take any action here? (depends on the use case)
        } else {
            // the proof verification has passed
            // now that we know that the random number was safely generated, let's use it..

            LogNewAuthenticatedResult(result);
        }
    }

    function sendQuery() payable {
        string memory query = "json(https://www.bitstamp.net/api/v2/ticker/ethusd/).last";
        bytes32 queryId = provable_query("URL", query);

        provable_proofShield_commitment[queryId] = keccak256(sha256(query), proofType_Android_v2);
    }

}
```

### More Examples
More complete, complex examples are available on the dedicated Github repository: <a href="https://github.com/provable-things/ethereum-examples" target="_blank">https://github.com/provable-things/ethereum-examples</a>
