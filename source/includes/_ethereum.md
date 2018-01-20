# &#9830; &nbsp; Ethereum

The following section is dedicated to the Ethereum and Oraclize integration.
To better profit from this section of the documentation, previous knowledge of Solidity and Ethereum is required.

The interaction between Oraclize and an Ethereum smart contract is asynchronous. Any request for data is composed of two steps:

* Firstly, in the most common case, a transaction executing a function of a smart contract is broadcasted by an user. The function contains a special instruction which manifest to Oraclize, who is constantly monitoring the Ethereum blockchain for such instruction, a request for data.
* Secondly, according to the parameters of such request, Oraclize will fetch or compute a result, build, sign and broadcast the transaction carrying the result. In the default configuration, such transaction will execute the `__callback` function which should be placed in the smart contract by its developer: for this reason, this transaction is referred in the documentation as the Oraclize callback transaction.

As said in previous sections, one of the fundamental characteristics of Oraclize is the capability of returning data to a smart contract together with one or more proofs of authenticity of the data. The generation of an authenticity proof is optional and it is a contract-wide setting which must be configured by the smart contract developer before the request for data is initiated. Oraclize always recommends the use of authenticity proofs for production deployments.  

## Quick Start

```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleContract is usingOraclize {

    string public EURGBP;
	event LogPriceUpdated(string price);
	event LogNewOraclizeQuery(string description);

    function ExampleContract() payable {
        updatePrice();
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) throw;
        EURGBP = result;
		LogPriceUpdated(result);
    }

 	function updatePrice() payable {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
           	LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        	oraclize_query("URL", "json(http://api.fixer.io/latest?symbols=USD,GBP).rates.GBP");
        }
    }
}
```

The most simple way to introduce the Ethereum - Oraclize integration, it is by showing a working example, such as the smart contract on the right.
This contract uses Oraclize to fetch the last EUR/GBP from fixer.io APIs. The update process is initiated every time the function updatePrice() is called. The example shows two important components of using Oraclize:

* The contract should be a child of the contract usingOraclize
* The contract usingOraclize is defined in the oraclizeAPI file, which can be fetched from the dedicated Oraclize Github repository.

The code in the example is working out of the box if Remix is used to compile and deploy it on any of the Ethereum networks: main-net and the Ropsten, Kovan and Rinkeby testnets. If, instead, another tool is used, it will be necessary to replace the import statement with a local import of the oraclizeAPI.sol file since direct import from Github may not be supported.

To ease development, Oraclize doesn't charge a contract for its first request of data done using the default gas parameters. Successive requests will require the contract to pay the Oraclize fee and the ether necessary to pay for the callback transaction. Both are automatically taken from the contract balance. If the contract doesn't have enough funds in his balance, the request will fail and Oraclize won't return any data.


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

    string public EURGBP;
	event LogPriceUpdated(string price);
	event LogNewOraclizeQuery(string description);

    function ExampleContract() payable {
        updatePrice();
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) throw;
        EURGBP = result;
		LogPriceUpdated(result);
		updatePrice();
    }

 	function updatePrice() payable {
        if (oraclize_getPrice("URL") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
           	LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        	oraclize_query(60, "URL", "json(http://api.fixer.io/latest?symbols=USD,GBP).rates.GBP");
        }
    }

```
Smart contract using Oraclize can be effectively autonomous by implementing a new call to Oraclize into their  ` __callback` method.
This can be useful for implementing periodic updates of some on-chain reference data, as with price feeds, or to periodically check for some off-chain conditions.

This modified version of the previous example will update the EUR/GBP exchange rate every 60 seconds, until the contract has enough funds to pay for the Oraclize fee.

### The Query ID
```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleContract is usingOraclize {

    string public EURGBP;
	mapping(bytes32=>bool) validIds;
	event LogPriceUpdated(string price);
    event LogNewOraclizeQuery(string description);

    function ExampleContract() payable {
        updatePrice();
    }

    function __callback(bytes32 myid, string result) {
        if (!validIds[myid]) throw;
		if (msg.sender != oraclize_cbAddress()) throw;
        EURGBP = result;
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
				oraclize_query(60, "URL", "json(http://api.fixer.io/latest?symbols=USD,GBP).rates.GBP");
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

    string public EURGBP;
	mapping(bytes32=>bool) validIds;
	event LogPriceUpdated(string price);
	event LogNewOraclizeQuery(string description);

	// This example requires funds to be send along with the contract deployment
	// transaction
    function ExampleContract() payable {
        oraclize_setCustomGasPrice(4000000000 wei);
		updatePrice();
    }

    function __callback(bytes32 myid, string result) {
        if (!validIds[myid]) throw;
		if (msg.sender != oraclize_cbAddress()) throw;
        EURGBP = result;
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
				oraclize_query(60, "URL", "json(http://api.fixer.io/latest?symbols=USD,GBP).rates.GBP", 500000);
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
oraclize_query("URL", "json(http://api.fixer.io/latest?symbols=USD,GBP).rates.GBP", 100000);

// Callback methods may be expensive. The example requires the JSON parsing
// a string in the smart contract. If that's the case, the gas should be increased:
oraclize_query("URL", "https://api.fixer.io/latest?symbols=USD,GBP", 500000);
```

The gas price of the callback transaction can be set by calling the `oraclize_setCustomGasPrice` function, either in the constructor, which is executed once at deployment of the smart contract, or in a separate function. The following is the ExampleContract modified to specify a custom gas price of 4 Gwei and a custom gas limit for the callback transaction.

Smart contract developers should estimate correctly and minimize the cost of their `__callback` method, as any unspent gas will be returned to Oraclize and no refund is available.


### Authenticity Proofs

```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ExampleContract is usingOraclize {

    string public EURGBP;
	mapping(bytes32=>bool) validIds;
	event LogPriceUpdated(string price);
	event LogNewOraclizeQuery(string description);


	// This example requires funds to be send along with the contract deployment
	// transaction
	function ExampleContract() payable {
        oraclize_setCustomGasPrice(4000000000 wei);
		oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
		updatePrice();
    }

    function __callback(bytes32 myid, string result, bytes proof) {
        if (!validIds[myid]) throw;
		if (msg.sender != oraclize_cbAddress()) throw;
        EURGBP = result;
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
				oraclize_query(60, "URL", "json(https://api.fixer.io/latest?symbols=USD,GBP).rates.GBP", 500000);
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
* `proofType_TLSNotary`
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


## Advanced Topics

### Encrypted Queries
Certain contexts, such as smart contracts on public blockchains, might require a level of privacy to protect data from public scrutiny. Developers can make encrypted Oraclize queries by encrypting a part (or all) of a query with the Oraclize public key.
The encrypted queries feature may be of interested to developers who want to deploy their blockchain applications of public networks. For example, if an application leverages data from an authenticated API, it would be dangerous to disclose the API key to anyway who is monitoring the public chain.  

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

To protect the plaintext queries, an Elliptic Curve Integrated Encryption Scheme was chosen. The steps performed for the encryption are the following ones:

* An Elliptic Curve Diffie-Hellman Key Exchange (ECDH), which uses secp256k1 as curve and ANSI X9.63 with SHA256 as Key Derivation Function. This algorithm is used to derive a shared secret from the Oraclize public key and ad-hoc, randomly generated developer private key.
* The shared secret is used by an AES-256 in Galois Counter Mode (GCM), an authenticated symmetric cipher, to encrypt the query string. The authentication tag is 16-bytes of length and the IV is chosen to be '000000000000' (96 bits of length). The IV can be set to the zero byte-array because each shared secret is thrown-away and use only once. Every time the encryption function is called a new developer private key is re-generated. The final ciphertext is the concatenation of the encoded point (i.e the public key of the developer), the authentication tag and the encrypted text.

### Computation Data Source

#### Passing Arguments to the Package
```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract Random is usingOraclize {

    event LogNewOraclizeQuery(string description);
    event LogNewRandomNumber(uint number);


    function Random() {
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        update();
    }

    function __callback(bytes32 myid, string result, bytes proof) {
        if (msg.sender != oraclize_cbAddress()) throw;
        LogNewRandomNumber(parseInt(result));
    }

    function update() payable {
        if (oraclize.getPrice("computation") > this.balance) {
            LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("computation",["QmR6qXv65K2EjKj5H9tFfzU6GDd9STYYvJMXFRRAskm3uF", "2"]);
        }
    }

}

```
Arguments can be passed to the package by adding parameters to the query array. They will be accesssible from within the Docker instances as environmental parameters.

```shell
FROM ubuntu:14.04
MAINTAINER Oraclize "marco@oraclize.it"

RUN apt-get update && apt-get -y install python-minimal

CMD /usr/bin/python -c "import os; print os.urandom(int(os.environ['ARG0'], 10))"
```

#### Passing Encrypted Arguments
```javascript
pragma solidity ^0.4.11;
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

contract ComputationTest is usingOraclize {


    event LogNewOraclizeQuery(string description);
    event LogNewResult(string result);

    function ComputationTest() {
        update(); // first check at contract creation
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) throw;
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

#### Two Party Interactions
```javascript
    function oraclize_newRandomDSQuery(uint _delay, uint _nbytes, uint _customGasLimit) internal returns (bytes32){
        if ((_nbytes == 0)||(_nbytes > 32)) throw;
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



### ProofShield

The Oraclize *ProofShield* is a concept first introduct at Devcon4, you can watch our presentation about "Scalable Onchain Verification for Authenticated Data Feeds and Offchain Computations" [here](https://www.youtube.com/watch?v=7uQdEBVu8Sk).

<aside class="notice">
The ProofShield is still EXPERIMENTAL, please DO NOT use it in production (yet). A production-ready version will follow in the future.
</aside>

The ProofShield enables smart contracts to verify on-chain the authenticity proofs provided by Oraclize, this ensures that the authenticity of the data received is verified before going ahead and using the data.


To enable the ProofShield it is enough to set it via the `oraclize_setProof` function like you see in the following code:


```javascript

    oraclize_setProof(proofType_Android_v2 | proofShield_Ledger);

````


Once the ProofShield is enabled, the received proof will not be the raw Authenticity Proof, but the ProofShield proof instead: some functions are provided so that the ProofShield proof can be verified on-chain. In order to verify it, you need to call from within the `__callback` method the function `oraclize_proofShield_proofVerify__returnCode(queryId, result, proof)` and ensure that it returns 0.

<aside class="notice">
The ProofShield is currently available on all Ethereum public testnets only (Rinkeby, Kovan, Ropsten-revival) - it is not integrated yet with private blockchains/testrpc/browser-solidity-vmmode.
</aside>

A code example follows, note that the complete version of it is available [here](https://github.com/oraclize/ethereum-examples/blob/master/solidity/proofshield/proofShieldExample.sol):

```javascript
contract proofShieldExample is usingOraclize {

    event LogNewAuthenticatedResult(string);

    function proofShieldExample() {
        oraclize_setProof(proofType_Android_v2 | proofShield_Ledger);
        sendQuery();
    }

    function __callback(bytes32 queryId, string result, bytes proof) {
        if (msg.sender != oraclize_cbAddress()) throw;

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

### More Examples
More complete, complex examples are available on the dedicated Github repository: <a href="https://github.com/oraclize/ethereum-examples" target="_blank">https://github.com/oraclize/ethereum-examples</a>
