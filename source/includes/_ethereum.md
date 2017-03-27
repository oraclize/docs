# Ethereum Integration

The following is meant to be a short but complete introduction to explain how the interfacing of an Ethereum contract with Oraclize actually works. 
To better profit from the documentation, previous knowledge of Solidity, the most used smart contract language on Ethereum, is required.

All the reference code used is written in Solidity, but since the interface would be the same for any other language.

Sending a query to Oraclize means sending a contract call, also called internal transaction, to the on-chain Oraclize contract.

* Take care of paying Oraclize the expected amount, which can vary depending on the sent query
* Pass the query in the right format.

With that, Oraclize will:

* Fetch your result
* Send it back to your address, which most of the time will be your own contract address, with a transaction calling a dedicated `__callback` method.

Note that the transaction sent back by Oraclize can trigger any status change in the calling contract, and can include the sending of another query to Oraclize. What can be done in the `__callback` method is only bounded by the block gas limit.

## Getting Everything on Track

First, place `usingOraclize` contract into your code. You do not need to import the `OraclizeI` and `OraclizeAddrResolverI` contract interfaces as this is taken care of.

The purpose of the `usingOraclize` contract is to make calls to `OraclizeI` and `OraclizeAddrResolverI` as painless as possible for you. However, if you know what you are doing, you are free to call our `OraclizeI` and `OraclizeAddrResolverI` interfaces directly. The upside is that you would spend a lower amount of gas for contract deployment. The downside is that if anything goes wrong a `throw` is raised.

In order to simplify the use of our API, we highly recommend that you simply extend the `usingOraclize` contract and use its inherited methods, about which we discuss below. Indeed, these methods already handle payments and API calls correctly.

All the code you need is found here <a href="http://dev.oraclize.it/api.sol" target="_blank">http://dev.oraclize.it/api.sol</a>. After making your contract extend `usingOraclize`, it would look like:

```javascript
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";
    
contract YourContractName is usingOraclize {

    function YourContractName() {
        ..
    } 
    
}
```

## Simple Query

> **Note:**
> All the code written here assumes that you have already included all the necessary code as described in the paragraphs above, and that your contract already extends our `usingOraclize` contract (if you are using Solidity).

When sending a query to Oraclize you have to specify at least two arguments:

* The data-source you want to fetch the data from. Supported values are `URL`, `WolframAlpha`, `Blockchain`, `IPFS`
* The argument for the given data-source:
 * the full `URL`, which might use our JSON / XML parsing helpers
 * or the `WolframAlpha` formula
 * or the `Blockchain`-provided syntax
 * or the `IPFS` multihash

More information about these can be found in the [Overview](#overview) document.

An example code might look like this:

```javascript
oraclize_query("WolframAlpha", "random number between 0 and 100");
```

This code example will ask Oraclize to send you back immediately a transaction with the primary result (as a string) of the given formula ("random number between 0 and 100") fetched from the data-source "WolframAlpha".

Similarly, you can use any other data-source, here we list some examples:

```javascript
oraclize_query("URL", "https://api.kraken.com/0/public/Ticker?pair=ETHXBT")
```

```javascript
oraclize_query("URL",
  "json(https://www.therocktrading.com/api/ticker/BTCEUR).result.0.last")
```

```javascript
oraclize_query("IPFS", "QmdEJwJG1T9rzHvBD8i69HHuJaRgXRKEQCP7Bh1BVttZbU")
```

```javascript
/* 
  the only data-source accepting 2 string arguments is
  'URL' when we want it to send an HTTP POST request
  with the 2nd argument being the query-string we want
  to send to the given server.

  note that when the 2nd argument is a valid JSON string
  it will be automatically sent as JSON
*/
oraclize_query("URL", "json(https://shapeshift.io/sendamount).success.deposit",
  '{"pair":"eth_btc","amount":"1","withdrawal":"1AAcCo21EUc1jbocjssSQDzLna9Vem2UN5"}')
```

## Schedule a Query in the Future

If you want Oraclize to execute your query at a scheduled future time, just specify the delay (in seconds) from the current time or the timestamp in the future as first argument.

Please note that in order for the future timestamp to be accepted by Oraclize it must be within 60 days from the current time.

```javascript
// get the result from the given URL 60 seconds from now
oraclize_query(60, "URL",
  "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0")
```

```javascript
// get the result from the given datasource at the specified timestamp in the future
oraclize_query(scheduled_arrivaltime+3*3600,
  "WolframAlpha", strConcat("flight ", flight_number, " landed"));
```

## The query ID

Every time you call `oraclize_query(...)`, it returns you a unique ID that represents your query. Whether you store this ID for future reference is up to you.

```javascript
// get the result from the given URL 60 seconds from now
bytes32 myid = oraclize_query(60, "URL",
  "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");
```

## Callback Functions

Once your result is ready, Oraclize will send a transaction back to your contract address, and invoke 1 of these 3 methods:

* either `__callback(bytes32 myid, string result)`
* or, **if you requested for the TLS Notary proof, `__callback(bytes32 myid, string result, bytes proof)`**
* or, as a last resort, if the other methods are absent, the fallback function `function()`
 
Here are some handling examples:

```javascript
function __callback(bytes32 myid, string result) {
    if (msg.sender != oraclize_cbAddress()) {
      // just to be sure the calling address is the Oraclize authorized one
      throw;
    }
    ETHXBT = result; // doing something with the result..
    // new query for Oraclize!
    bytes32 myid = oraclize_query(60, "URL",
      "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");
}
```

In the snippet above we call `oraclize_query` again within the `__callback` function. In effect, this makes the contract receive automatically `__callback` every minute forever. Or at least, until you run out of funds!

Note that `myid` can be used to implement different behaviours into the `__callback` function, in particular when there is more than one pending call from Oraclize.


## Custom Gas

The transaction originating from Oraclize to your `__callback` function costs gas, just like any other transaction. However, as you learned earlier, you need to cover Oraclize for this gas cost, and the `oraclize_query` function helpfully handles that. It defaults at 200,000 gas.

This *return* gas cost is actually in your control since you write the code in the `__callback` method, and as such, can estimate it. So, when placing a query with Oraclize, you can also specify how much the `gasLimit` should be on the `__callback` transaction. Note however that, since  Oraclize sends the transaction, any unspent gas is returned to Oraclize, not you.

If the default, and minimum, value of 200,000 gas,  is not enough, you can increase it by specifying a different `gasLimit` in this way:

```javascript
// Oraclize will use a 500k gasLimit for the callback transaction, instead of 200k
oraclize_query("WolframAlpha", "random number between 0 and 100", 500000);
```

```javascript
// you can set both custom timestamp/delay and custom gasLimit
oraclize_query(60, "WolframAlpha", "random number between 0 and 100", 500000);
```

Note also that if you offer too low a `gasLimit`, and your `__callback` method is long, you may never see a callback.

## TLSNotary Proof

In order to get, or not, the TLSNotary proof back from Oraclize you need to specify the `proofType` and `proofStorage`. You do this by calling: 

* either `oraclize_setProof(proofType_NONE)`
* or `oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS)` 

You may execute this method just once, for instance in the constructor, or at any other time, if, for instance, you need the proof for certain queries only. 

* `proofType_NONE` is the default setting
* `proofType_IPFS` is the only method of storage supported, at the time of writing, for the TLSNotary proof.

`proofStorage_IPFS` means that Oraclize will:

* use <a href="http://ipfs.io/" target="_blank">IPFS</a> to store your complete TLSNotary proof
* and will call back your contract on the `__callback(bytes32 myid, string result, bytes proof)` function **instead of the default** `__callback(bytes32 myid, string result)`

The `proof` string is exactly the IPFS multihash that identifies your TLSNotary proof, so you can fetch it for example at http://ipfs.io/ipfs/`proof`


> **Note:**
>There might not always be a TLSNotary proof for your query, depending on the data source you have chosen

Here is an example:

```javascript
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";
    
contract YourContractName is usingOraclize {
    
    function YourContractName() {
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        oraclize_query("URL",
          "xml(https://www.fueleconomy.gov/ws/rest/fuelprices).fuelPrices.diesel");
    }
    
    function __callback(bytes32 myid, string result, bytes proof) {
        if (msg.sender != oraclize_cbAddress()) throw;
        ..
    }
}
```



## More Examples

You can have a look at more complete and complex examples by heading to our dedicated github repository: <a href="https://github.com/oraclize/ethereum-examples" target="_blank">https://github.com/oraclize/ethereum-examples</a>


## Random Utilities

Since the callback transaction always provides results as strings, the Solidity API helpers also include some convenience functions, which might prove useful to you. Especially since Solidity does not provide any official "standard Library" yet.

You can check them out <a href="https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI.sol#L124" target="_blank">here</a>.

## Best Practices

```javascript
import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";
    
contract YourContractName is usingOraclize {

    mapping(bytes32=>bool) myidList;

    function YourContractName(){
         oraclize_query("URL","json(http://exampleUrl.url).result");
    }

    function __callback(bytes32 myid, string result) {
        if(msg.sender != oraclize_cbAddress()) throw;
        if(myidList[myid]==true) {
          // check if this myid was already processed before
          throw;
        }
        myidList[myid] = true; // mark this myid (default bool value is false)
        ...
    }
    
}
```
 
What follows are some practical tips we recommend you to use when writing Oraclize-based smart contracts:

 * when integrating the Oraclize service into your smart contract it's better to use our <a href="https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI.sol" target="_blank">API helpers</a> instead of interfacing with the connector directly as the connector address may be updated.
     
 * the `myid` returned by Oraclize in the `__callback` function should always be checked by your smart contract. Specifically, the smart contract should verify that the `myid` is unique and consequently mark it. This ensures each query response is processed only once and helps to avoid misuses of your contract logic.
