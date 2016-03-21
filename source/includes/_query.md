# How to send a query

The following is meant to be a short but complete manual to explain how the interfacing of an Ethereum contract with Oraclize actually works.

All the reference code we will be using next is written in Solidity, but since the interface would be the same feel free to use any language you like.

Sending a query to Oraclize means sending a transaction to the last Oraclize contract. In order to do that we have to take care of paying Oraclize the amount expected, which can vary depending on the query we are about to send, and to send to it the query in the right format.
Oraclize will then get your result and send back to your address (which most of times will be your contract address!) a transaction calling a special `__callback` method. Note that the transaction sent back by Oraclize can trigger any status change in your contract, even the sending of another query to Oraclize. The limit of what can be done in the `__callback` method is given just by your immagination and, well, by the gasLimit.


## Getting everything on track

The first thing we need to do is to import into our code the `usingOraclize` contracts other than the interfaces of the `OraclizeI` and `OraclizeAddrResolverI` contracts. The `usingOraclize` contract is needed to ensure the interfacing with the `OraclizeI` and `OraclizeAddrResolverI` is painless to you, but if you feel confident in calling them directly feel free to do so (you would spend a lower amount of gas for contract deployment) as long as you do it correctly (if anything goes wrong a `throw` is raised).

In order to make the API use flow simpler we highly recommend you to simply extend the `usingOraclize` contract and to use its inherited methods we will talk about in a while: all these methods are already taking care of handling the payments and the API calls correctly.

To include all the stuff needed just import the code available here <a href="http://dev.oraclize.it/api.sol">http://dev.oraclize.it/api.sol</a> and make your contract extend the `usingOraclize` one as follows

```javascript
/*
import "dev.oraclize.it/api.sol" just works while using 
dev.oraclize.it web IDE, needs to be imported manually otherwise 
*/ 
import "dev.oraclize.it/api.sol"; 

contract YourContractName is usingOraclize { .. }
```

```python

# In serpent you just need to import (inset)
# the oraclize API inside your contract

inset("oraclizeAPI.se")

```


## Network selection

Oraclize is available both on the Ethereum mainnet and on the Morden testnet, the default behaviour (whie using the API helpers we are explaining here) is to refer to the mainnet, however if you want to point it to a different network you can do it explicity by calling the `oraclize_setNetwork` function once (for example in your contract constructor).

```javascript
/*
import "dev.oraclize.it/api.sol" just works while using 
dev.oraclize.it web IDE, needs to be imported manually otherwise 
*/
import "dev.oraclize.it/api.sol";
    
contract YourContractName is usingOraclize {
        
    function YourContractName(){
        oraclize_setNetwork(networkID_testnet);
    }
        
    ..
}
```

```python

# In serpent you just need to import (inset)
# the oraclize API inside your contract

inset("oraclizeAPI.se")

def init():
    oraclize_setNetwork(networkID_testnet)

```



## Simple query

> **Note:**
>All the code written here takes for granted that you already included all the needed stuff as explained in the paragraph above, other than this your contract has to extend the `usingOraclize` contract

When sending a query to Oraclize you have to specify at least two arguments:
* the data-source you want to fetch the data from (supported values: `URL`, `WolframAlpha`, `Blockchain`)
* the argument for the given data-source (the full `URL` - which might use our json/xml helper format -, the `WolframAlpha` formula or the `Blockchain`-provided syntax), more informations about these can be found in the [Overview](#overview)

An example code looks like this:

```javascript

oraclize_query("WolframAlpha", "random number between 0 and 100");

```
```python

oraclize_query(text("WolframAlpha"), text("random number between 0 and 100"))

```

The given code will ask Oraclize to send immediately back to us a transaction with the primary result (as a string) of the given formula ("random number between 0 and 100") fetched from the data-source "WolframAlpha".

In the same way you can use any other data-source, here we list some examples:

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
/* 
  the only data-source accepting 2 string arguments is
  'URL' when we want it to send an HTTP POST request
  with the 2nd argument being the query-string we want
  to send to the given server.
  
  note that when the 2nd argument is a valid JSON string it will be automatically sent as JSON
*/
oraclize_query(text("URL"), text("json(https://shapeshift.io/sendamount).success.deposit"), text('{"pair": "eth_btc", "amount": "1", "withdrawal": "1AAcCo21EUc1jbocjssSQDzLna9Vem2UN5"}'))

```



## Schedule a query in the future

If you want Oraclize to execute your query at a scheduled future time, just specify the delay from the current time (in seconds) or the timestamp in the future as first argument.

Please note that in order for the future timestamp to be accepted by Oraclize it must be within 60 days from the current time.


Here some example:


```javascript

// get the result from the given URL in 60 seconds from now
oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");

```
```python

# get the result from the given URL in 60 seconds from now
oraclize_query(60, text("URL"), text("json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0"))

```


```javascript

// get the result from the given URL at the specified timestamp in the future
oraclize_query(scheduled_arrivaltime+3*3600, "WolframAlpha", strConcat("flight ", flight_number, " landed"));

```


## The query ID

Even if storing it is not always needed, `oraclize_query` is returning a unique ID representing your query.

```javascript

// get the result from the given URL in 60 seconds from now
bytes32 myid = oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");

```
```python

# get the result from the given URL in 60 seconds from now
data myid = oraclize_query(60, text("URL"), text("json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0"));

```


## Callback function

Once your result is ready Oraclize will send a transaction back to your contract address, calling the method with the signature `__callback(bytes32 myid, string result)`. The callback transaction could be handled in the unnamed function `function()` or, more easily, by implementing the __callback function as follows:

```javascript

function __callback(bytes32 myid, string result) {
    if (msg.sender != oraclize_cbAddress()) throw; // just to be sure the calling address is the Oraclize authorized one
    ETHXBT = result; // doing something with the result..
    bytes32 myid = oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0"); // new query for Oraclize!
}

```
```python

def __callback(myid:bytes32, result:string):
    if (msg.sender != oraclize_cbAddress()):
        return # just to be sure the calling address is the Oraclize authorized one
    self.ETHXBT = result # doing something with the result..
    data myid = oraclize_query(60, text("URL"), text("json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0")) # new query for Oraclize!

```


In the code above we put the `oraclize_query` call in the __callback function, by making the contract automatically execute __callback every minute forever (well, until we run out of funds!).
Note that `myid` can be used to implement different behaviours into the __callback function when we are waiting for more than one different pending callback call from Oraclize.



## Custom gas

Since you have to cover for the amount of gas the Oraclize transaction will spend to call your __callback function code, you are always paying for the full `gasLimit` set in the Oraclize callback transaction.
The minimum default value is 200000 gas, if this is not enough for you you can increase it by specifying a different `gasLimit` in this way:

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


## TLSNotary proof

In order to get the TLSNotary proof back from Oraclize you need to specify the proofType and proofStorage, with `oraclize_setProof(proofType_NONE)` (default) or `oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS)`.
You can execute this method just once in the constructor or wherever you want if you need the proof just for certain queries. `prootType_NONE` is the default one, proofType_IPFS is the only method supported at the moment to deliver the TLSNotary proof.


`proofStorage_IPFS` means Oraclize will use IPFS to store your complete TLSNotary proof and will get back to your contract calling the `__callback(bytes32 myid, string result, bytes proof)` function instead of the default `__callback(bytes32 myid, string result)` one.

The `proof` string is precisely the IPFS multihash that identifies your TLSNotary proof, so you can fetch it for example at http://ipfs.io/ipfs/`proof`


> **Note:**
>There might not always be a TLSNotary proof for your query, depending on the data source you have chosen



```javascript
/*
import "dev.oraclize.it/api.sol" just works while using 
dev.oraclize.it web IDE, needs to be imported manually otherwise 
*/
import "dev.oraclize.it/api.sol";
    
contract YourContractName is usingOraclize {
    
    function YourContractName(){
        oraclize_setNetwork(networkID_testnet);
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
    oraclize_setNetwork(networkID_testnet)
    oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS)
    oraclize_query(text("URL"), text("xml(https://www.fueleconomy.gov/ws/rest/fuelprices).fuelPrices.diesel"))

def __callback(myid:bytes32, result:string, proof:bytes):
    if (msg.sender != oraclize_cbAddress()):
        return
    ..

```



## More examples

You can have a look at more complete and complex examples by looking at our dedicated github repository here: https://github.com/oraclize/ethereum-examples



## Random utilities

Since the callback transaction is always providing the results as a string, the Solidity API helpers are also including some convenient functions which might be useful to you (since Solidity does not provide any official "standard Library" yet).

You can check them out [here](https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI.sol#L108)


