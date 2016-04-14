# How to send a query

The following is meant to be a short but complete manual to explain how the interfacing of an Ethereum contract with Oraclize actually works.

All the reference code we will be using next is written in Solidity, but since the interface would be the same for any other language, feel free to use one you like.

Sending a query to Oraclize means sending a transaction to the last Oraclize contract. In order to do that we have to:

* take care of paying Oraclize the expected amount, which can vary depending on the query we are about to send
* and pass the query in the right format.

With that, Oraclize will:

* fetch your result
* then send it back to your address, which most of the time will be your own contract address, with a transaction calling a dedicated `__callback` method.

Note that the transaction sent back by Oraclize can trigger any status change in your contract, and can include the sending of another query to Oraclize. What can be done in the `__callback` method is limited by your immagination and, well, the `gasLimit`.


## Getting everything on track
**If you are using Solidity:**
First, you need to import our `usingOraclize` contract into your code. You do not need to import the `OraclizeI` and `OraclizeAddrResolverI` contract interfaces as this is taken care of.

The purpose of the `usingOraclize` contract is to make calls to `OraclizeI` and `OraclizeAddrResolverI` as painless as possible for you. However, if you know what you are doing, you are free to call our `OraclizeI` and `OraclizeAddrResolverI` interfaces directly. The upside is that you would spend a lower amount of gas for contract deployment. The downside is that if anything goes wrong a `throw` is raised.

In order to simplify the use of our API, we highly recommend that you simply extend the `usingOraclize` contract and use its inherited methods, about which we discuss below. Indeed, these methods already handle payments and API calls correctly.

All the code you need is found here <a href="http://dev.oraclize.it/api.sol" target="_blank">http://dev.oraclize.it/api.sol</a>. After making your contract extend `usingOraclize`, it would look like:

```javascript
/*
import "dev.oraclize.it/api.sol" just works while using 
dev.oraclize.it web IDE, needs to be imported manually otherwise 
*/ 
import "dev.oraclize.it/api.sol"; 

contract YourContractName is usingOraclize { .. }
```

**If you are using Serpent:**
You just need to import the oraclize API via `inset()` command, you can find all the code you need to import here <a href="http://dev.oraclize.it/api.se" target="_blank">http://dev.oraclize.it/api.se</a>


```python
# In serpent you just need to import (inset)
# the oraclize API inside your contract

inset("oraclizeAPI.se")
```


## Network selection

Oraclize is available both on the Ethereum mainnet and on the Morden testnet.

```javascript
/*
import "dev.oraclize.it/api.sol" just works while using 
dev.oraclize.it web IDE, needs to be imported manually otherwise 
*/
import "dev.oraclize.it/api.sol";
    
contract YourContractName is usingOraclize {

    function YourContractName(){

    } 
    ..
}
```

```python
# In serpent you just need to import (inset)
# the oraclize API inside your contract

inset("oraclizeAPI.se")

def init():


```


## Simple query

> **Note:**
> All the code written here assumes that you have already included all the necessary code as described in the paragraphs above, and that your contract already extends our `usingOraclize` contract (if you are using Solidity).

When sending a query to Oraclize you have to specify at least two arguments:

* The data-source you want to fetch the data from. Supported values are `URL`, `WolframAlpha`, `Blockchain`
* The argument for the given data-source:
 * the full `URL`, which might use our JSON / XML parsing helpers
 * or the `WolframAlpha` formula
 * or the `Blockchain`-provided syntax

More information about these can be found in the [Overview](#overview) document.

An example code might look like this:

```javascript
oraclize_query("WolframAlpha", "random number between 0 and 100");
```

```python
oraclize_query(text("WolframAlpha"), text("random number between 0 and 100"))
```

This code example will ask Oraclize to send you back immediately a transaction with the primary result (as a string) of the given formula ("random number between 0 and 100") fetched from the data-source "WolframAlpha".

Similarly, you can use any other data-source, here we list some examples:

```javascript
oraclize_query("URL", "api.kraken.com/0/public/Ticker?pair=ETHXBT");
```

```python
oraclize_query(text("URL"), text("api.kraken.com/0/public/Ticker?pair=ETHXBT"))
```

```javascript
oraclize_query("URL", "json(https://www.therocktrading.com/api/ticker/BTCEUR).result.0.last");
```

```python
oraclize_query(text("URL"), text("json(https://www.therocktrading.com/api/ticker/BTCEUR).result.0.last"))
```

```javascript
/* 
  the only data-source accepting 2 string arguments is
  'URL' when we want it to send an HTTP POST request
  with the 2nd argument being the query-string we want
  to send to the given server.

  note that when the 2nd argument is a valid JSON string it will be automatically sent as JSON
*/
oraclize_query("URL", "json(https://shapeshift.io/sendamount).success.deposit", '{"pair": "eth_btc", "amount": "1", "withdrawal": "1AAcCo21EUc1jbocjssSQDzLna9Vem2UN5"}');
```

```python
# the only data-source accepting 2 string arguments is
# 'URL' when we want it to send an HTTP POST request
# with the 2nd argument being the query-string we want
# to send to the given server.
  
# note that when the 2nd argument is a valid escaped JSON string it will be automatically sent as JSON
#      in serpent you must escape the JSON object

oraclize_query(text("URL"), text("json(https://shapeshift.io/sendamount).success.deposit"), text("{\"pair\": \"eth_btc\", \"amount\": \"1\", \"withdrawal\": \"1AAcCo21EUc1jbocjssSQDzLna9Vem2UN5\"}"))
```


## Schedule a query in the future

If you want Oraclize to execute your query at a scheduled future time, just specify the delay (in seconds) from the current time or the timestamp in the future as first argument.

Please note that in order for the future timestamp to be accepted by Oraclize it must be within 60 days from the current time.

```javascript
// get the result from the given URL 60 seconds from now
oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");
```

```python
# get the result from the given URL 60 seconds from now
oraclize_query(60, text("URL"), text("json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0"))
```

```javascript
// get the result from the given URL at the specified timestamp in the future
oraclize_query(scheduled_arrivaltime+3*3600, "WolframAlpha", strConcat("flight ", flight_number, " landed"));
```


## The query ID

Every time you call `oraclize_query(...)`, it returns you a unique ID that represents your query. Whether you store this ID for future reference is up to you.

```javascript
// get the result from the given URL 60 seconds from now
bytes32 myid = oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");
```

```python
# get the result from the given URL 60 seconds from now
data myid

self.myid = oraclize_query(60, text("URL"), text("json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0"));
```


## Callback functions

Once your result is ready, Oraclize will send a transaction back to your contract address, and invoke 1 of these 3 methods:

* either `__callback(bytes32 myid, string result)`
* or, if you requested for the TLS Notary proof, `__callback(bytes32 myid, string result, bytes proof)`
* or, as a last resort, if the other methods are absent, the fallback function `function()`
 
Here are some handling examples:

```javascript
function __callback(bytes32 myid, string result) {
    if (msg.sender != oraclize_cbAddress()) throw; // just to be sure the calling address is the Oraclize authorized one
    ETHXBT = result; // doing something with the result..
    bytes32 myid = oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0"); // new query for Oraclize!
}
```

```python
data myid

def __callback(myid:bytes32, result:string):
    if (msg.sender != oraclize_cbAddress()):
        return # just to be sure the calling address is the Oraclize authorized one
    self.ETHXBT = result # doing something with the result..
    self.myid = oraclize_query(60, text("URL"), text("json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0")) # new query for Oraclize!
```

In the snippet above we call `oraclize_query` again within the `__callback` function. In effect, this makes the contract receive automatically `__callback` every minute forever. Or at least, until you run out of funds!

Note that `myid` can be used to implement different behaviours into the `__callback` function, in particular when there is more than one pending call from Oraclize.


## Custom gas

The transaction originating from Oraclize to your `__callback` function costs gas, just like any other transaction. However, as you learned earlier, you need to cover Oraclize for this gas cost, and the `oraclize_query` function helpfully handles that. It defaults at 200,000 gas.

This *return* gas cost is actually in your control since you write the code in the `__callback` method, and as such, can estimate it. So, when placing a query with Oraclize, you can also specify how much the `gasLimit` should be on the `__callback` transaction. Note however that, since  Oraclize sends the transaction, any unspent gas is returned to Oraclize, not you.

If the default, and minimum, value of 200,000 gas,  is not enough, you can increase it by specifying a different `gasLimit` in this way:

```javascript
oraclize_query("WolframAlpha", "random number between 0 and 100", 500000); // Oraclize will use a 500k gasLimit for the callback transaction, instead of 200k
```

```python
oraclize_query(text("WolframAlpha"), text("random number between 0 and 100"), 500000) # Oraclize will use a 500k gasLimit for the callback transaction, instead of 200k
```

```javascript
oraclize_query(60, "WolframAlpha", "random number between 0 and 100", 500000); // you can set both custom timestamp/delay and custom gasLimit
```

```python
oraclize_query(60, text("WolframAlpha"), text("random number between 0 and 100"), 500000) # you can set both custom timestamp/delay and custom gasLimit
```

Note also that if you offer too low a `gasLimit`, and your `__callback` method is long, you may never see a callback.

## TLSNotary proof

In order to get, or not, the TLSNotary proof back from Oraclize you need to specify the `proofType` and `proofStorage`. You do this by calling: 

* either `oraclize_setProof(proofType_NONE)`
* or `oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS)` 

You may execute this method just once, for instance in the constructor, or at any other time, if, for instance, you need the proof for certain queries only. 

* `proofType_NONE` is the default setting
* `proofType_IPFS` is the only method of storage supported, at the time of writing, for the TLSNotary proof.

`proofStorage_IPFS` means that Oraclize will:

* use [IPFS](http://ipfs.io/) to store your complete TLSNotary proof
* and will call back your contract on the `__callback(bytes32 myid, string result, bytes proof)` function instead of the default `__callback(bytes32 myid, string result)`

The `proof` string is exactly the IPFS multihash that identifies your TLSNotary proof, so you can fetch it for example at http://ipfs.io/ipfs/`proof`


> **Note:**
>There might not always be a TLSNotary proof for your query, depending on the data source you have chosen

Here is an example:

```javascript
/*
import "dev.oraclize.it/api.sol" just works while using 
dev.oraclize.it web IDE, needs to be imported manually otherwise 
*/
import "dev.oraclize.it/api.sol";
    
contract YourContractName is usingOraclize {
    
    function YourContractName(){
        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        oraclize_query("URL", "xml(https://www.fueleconomy.gov/ws/rest/fuelprices).fuelPrices.diesel");
    }
    
    function __callback(bytes32 myid, string result, bytes proof){
        if (msg.sender != oraclize_cbAddress()) throw;
        ..
    }
}
```

```python
# In serpent you just need to import (inset)
# the oraclize API inside your contract

inset("oraclizeAPI.se")

def init():
    oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS)
    oraclize_query(text("URL"), text("xml(https://www.fueleconomy.gov/ws/rest/fuelprices).fuelPrices.diesel"))

def __callback(myid:bytes32, result:string, proof:bytes):
    if (msg.sender != oraclize_cbAddress()):
        return
    ..
```


## More examples

You can have a look at more complete and complex examples by heading to our dedicated github repository: <a href="https://github.com/oraclize/ethereum-examples" target="_blank">https://github.com/oraclize/ethereum-examples</a>


## Random utilities

Since the callback transaction always provides results as strings, the Solidity API helpers also include some convenience functions, which might prove useful to you. Especially since Solidity does not provide any official "standard Library" yet.

You can check them out <a href="https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI.sol#L124" target="_blank">here</a>.