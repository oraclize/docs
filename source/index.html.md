# Introduction

## Welcome to Oraclize's documentation!

Oraclize is a <u title="(the amount of trust involved is close to zero)">provably-honest oracle</u> service enabling smart contracts to access the Internet.

We are platform-agnostic by providing an abstraction interface to all the major smart-contracts capable platforms out there (Bitcoin and Ethereum for now).
We think that it's just by throwing tons of meaningful data into the blockchain jar that the smart contracts industry can flourish and many useful applications can finally come to life.


While any platform is providing access to on-chain data only, Oraclize provides to them an interface to any data-feed on the Internet.


This documentation covers our API integration with the **Ethereum** platform.


![](images/flowchart.png)

# Overview

Even though the oracle concept, in the blockchain sense, has been around for a while haven't seen any advanced implementations. All implementations were nothing more than proof of concepts or of very limited use in themselves.

One of the reasons for this failure to provide a proper oracle service is that trying to build a distributed oracle network where nodes attempt to find consensus to a specific query is very hard and needs a proper inter-oracle communication protocol (which Orisi was a first attempt to build) rather than merely a convincing incentive for the oracles not to lie.

Oraclize wants to fill in this industry gap by providing an oracle service which is as generic as possible. We are not trying to build the Internet here but to provide a good compromise instead.

Although we are a centralized service we share the vision behind decentralized networks and we understand how reputation is key and this is why we are providing a provably-honest service too.


## How does an oracle work

An oracle, in the blockchain sense, is a third party which sends to your on-chain smart contract some specific data your smart contract code cannot fetch by itself. As the oracle is a centralized party, you shouldn't take its response for granted.

For example, if you ask an oracle to give you the last trading price of ETH/USD the oracle needs to fetch this data from some exchanges on the Internet and than send this data back to you. While doing this the oracle might compromise the exchange data and send back to you a compromised value. This is the reason why the oracle cannot be trusted by itself. It is important to trust the data-feed provider (in our example this is the exchange trading the ETH/USD pair) but this can easily be mitigated by using different data-sources and and using them to determine consensus.

But how can we trust the oracle not to alter this data in the first place? This is achievable using the same mitigation technique we just explained above for data-sources or by using a cryptographic proof such as the TLSNotary one.

## TLSNotary proof

Since we understand you may not trust our service to provide you correct data, we optionally send you a cryptographic proof showing that we didn't alter the data coming from your chosen data-source.

TLSNotary is built on the top of TLS/SSL, it's a tool by which you can prove a certain server has really sent some data to you at a certain time. By attaching the TLSNotary proof to the results we are providing to you, you can be 100% sure we are not lying and our response is really coming from a certain server at a specific time.


## Available data-sources

We list here the data-sources you can choose from when using our oracle service.

### Parsing helpers

The most generic data-source we provide is the `URL` one, which can be used to access any public API/page on the Internet.
The first step is providing the actual URL you want Oraclize to fetch the HTTP GET/POST output from (and optionally the query-string parameters). Oraclize will do that for you while optionally attaching the ``TLSNotary`` proof to the response forwarded to you.

In order to make things more simple to handle on the smart-contract side, you can provide the URL inside one of the following parsing helpers:

* `xml(..)` or `json(..)` helper: by providing the URL inside of one of them, you expect Oraclize to send you only a part of the json/xml-parsed response. Example: you can use the `URL` data-source with the URL argument `api.kraken.com/0/public/Ticker?pair=ETHUSD` to get the whole response back; but if you want to get the last-price field back only, you can just use the URL argument `json(api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0`.

* `html(..).xpath(..)` helper: this is useful for html scraping. Just specify the <a href="https://en.wikipedia.org/wiki/XPath" target="_blank">XPATH</a> you want as `xpath(..)` argument. Example: to fetch the text of a specific tweet: `html(https://twitter.com/oraclizeit/status/671316655893561344).xpath(//*[contains(@class, 'tweet-text')]/text())`.

> **Note:**
> In the case of the server not responding or if it is unreachable, we will send to you just an empty response

### Wolfram Alpha

The `WolframAlpha` data-source lets you specify as argument a query to submit to the Wolfram Alpha knowledge engine. Oraclize will send back to you the primary response as string if any.

> **Note:**
> There may not always be a primary response for your query, please test your query in advance on our Web IDE widget to make sure your syntax makes sense to Wolfram's engine.

<aside class="notice">
Note:
With this data-source the `TLSNotary` proof is unavailable since we would be giving back to you the whole API response by going against the Wolfram Alpha Terms of Service.
</aside>


### Blockchain

The `Blockchain` data-source provides you easy access to blockchain-related data. You can see this data-source as a shortcut to common block explorers APIs, but with a builtin easy-to-use syntax.
Possible query arguments can be: `bitcoin blockchain height`, `litecoin hashrate`, `bitcoin difficulty`, `1NPFRDJuEdyqEn2nmLNaWMfojNksFjbL4S balance` and so on.


# How to send a query

The following is meant to be a short but complete manual to explain how the interfacing of an Ethereum contract with Oraclize actually works.

All the reference code we will be using next is written in Solidity, but since the interface would be the same feel free to use any language you like.

Sending a query to Oraclize means sending a transaction to the last Oraclize contract. In order to do that we have to take care of paying Oraclize the amount expected, which can vary depending on the query we are about to send, and to send to it the query in the right format.
Oraclize will then get your result and send back to your address (which most of times will be your contract address!) a transaction calling a special `__callback` method. Note that the transaction sent back by Oraclize can trigger any status change in your contract, even the sending of another query to Oraclize. The limit of what can be done in the `__callback` method is given just by your immagination and, well, by the gasLimit.


## Getting everything on track

The first thing we need to do is to import into our code the `usingOraclize` contracts other than the interfaces of the `OraclizeI` and `OraclizeAddrResolverI` contracts. The `usingOraclize` contract is needed to ensure the interfacing with the `OraclizeI` and `OraclizeAddrResolverI` is painless to you, but if you feel confident in calling them directly feel free to do so (you would spend a lower amount of gas for contract deployment) as long as you do it correctly (if anything goes wrong a `throw` is raised).

In order to make the API use flow simpler we highly recommend you to simply extend the `usingOraclize` contract and to use its inherited methods we will talk about in a while: all these methods are already taking care of handling the payments and the API calls correctly.

To include all the stuff needed just import the code available here <a href="http://dev.oraclize.it/api.sol">http://dev.oraclize.it/api.sol</a> and make your contract extend the `usingOraclize` one as follows:

```javascript
/*
import "dev.oraclize.it/api.sol" just works while using 
dev.oraclize.it web IDE, needs to be imported manually otherwise 
*/ 
import "dev.oraclize.it/api.sol"; 

contract YourContractName is usingOraclize { .. }
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

The given code will ask Oraclize to send immediately back to us a transaction with the primary result (as a string) of the given formula ("random number between 0 and 100") fetched from the data-source "WolframAlpha".

In the same way you can use any other data-source, here we list some examples:

```javascript

oraclize_query("URL", "api.kraken.com/0/public/Ticker?pair=ETHXBT");

```

```javascript

oraclize_query("URL", "json(https://www.therocktrading.com/api/ticker/BTCEUR).result.0.last");

```

```javascript

// the only data-source accepting 2 string arguments is 'URL' when we want it to send an HTTP POST request
// with the 2nd argument being the query-string we want to send to the given server.
// note that when the 2nd argument is a valid JSON string it will be automatically sent as JSON
oraclize_query("URL", "json(https://shapeshift.io/sendamount).success.deposit", '{"pair": "eth_btc", "amount": "1", "withdrawal": "1AAcCo21EUc1jbocjssSQDzLna9Vem2UN5"}');

```




## Schedule a query in the future

If you want Oraclize to execute your query at a scheduled future time, just specify the delay from the current time (in seconds) or the timestamp in the future as first argument.

Please note that in order for the future timestamp to be accepted by Oraclize it must be within 60 days from the current time.


Here some example:


```javascript

// get the result from the given URL in 60 seconds from now
oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");

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


## Callback function

Once your result is ready Oraclize will send a transaction back to your contract address, calling the method with the signature `__callback(bytes32 myid, string result)`. The callback transaction could be handled in the unnamed function `function()` or, more easily, by implementing the __callback function as follows:

```javascript

function __callback(bytes32 myid, string result) {
    if (msg.sender != oraclize_cbAddress()) throw; // just to be sure the calling address is the Oraclize authorized one
    ETHXBT = result; // doing something with the result..
    bytes32 myid = oraclize_query(60, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0"); // new query for Oraclize!
}

```


In the code above we put the `oraclize_query` call in the __callback function, by making the contract automatically execute __callback every minute forever (well, until we run out of funds!).
Note that `myid` can be used to implement different behaviours into the __callback function when we are waiting for more than one different pending callback call from Oraclize.



## Custom gas

Since you have to cover for the amount of gas the Oraclize transaction will spend to call your __callback function code, you are always paying for the full `gasLimit` set in the Oraclize callback transaction.
The minimum default value is 200000 gas, if this is not enough for you you can increase it by specifying a different `gasLimit` in this way:

```javascript

oraclize_query("WolframAlpha", "random number between 0 and 100", 500000); // Oraclize will use a 500k gasLimit for the callback transaction, instead of 200k

```

```javascript

oraclize_query(60, "WolframAlpha", "random number between 0 and 100", 500000); // you can set both custom timestamp/delay and custom gasLimit

```


## TLSNotary proof

In order to get the TLSNotary proof back from Oraclize you need to specify the proofType and proofStorage, with `oraclize_setProof(proofType_NONE)` (default) or `oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS)`.
You can execute this method just once in the constructor or wherever you want if you need the proof just for certain queries. `prootType_NONE` is the default one, proofType_IPFS is the only method supported at the moment to deliver the TLSNotary proof.


`proofStorage_IPFS` means Oraclize will use IPFS to store your complete TLSNotary proof and will get back to your contract calling the `__callback(bytes32 myid, string result, bytes proof)` function instead of the default `__callback(bytes32 myid, string result)` one.

The `proof` string is precisely the IPFS multihash that identifies your TLSNotary proof, so you can fetch it for example at http://ipfs.io/ipfs/`proof`


> **Note:**
>There might not always be a TLSNotary proof for your query, depending on the data source you have chosen


Example code:

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




## More examples

You can have a look at more complete and complex examples by looking at our dedicated github repository here: https://github.com/oraclize/ethereum-examples



## Random utilities

Since the callback transaction is always providing the results as a string, the Solidity API helpers are also including some convenient functions which might be useful to you (since Solidity does not provide any official "standard Library" yet).

You can check them out [here](https://github.com/oraclize/ethereum-api/blob/master/oraclizeAPI.sol#L108)


# Pricing

The use of Oraclize APIs requires the payment of a small fee, other than the reimbursement of the full gasLimit we are setting in the transaction sent back to your contract.



## Free calls

In order to make the testing of our service a little bit easier (and cheaper) to you, **the first Oraclize query call coming from any Ethereum address is completely free of charge**. This means we are even covering the callback transaction gas costs for you (up to the default gasLimit of 200k gas).

This might be helpful, for example, to send the first call to Oraclize directly from your contract constructor without having to create your contract with an attached amount of Wei. This means, again, that you can have a free triggering transaction for any date in the future (up to 60 days).

>Note: all the Oraclize calls are free while using Oraclize on testnets! This is for a moderate use in test environments only.


## Call fees

Our pricing model is simple, you are automatically paying (when calling oraclize_query):

* a price in $ (automatically converted in Ether at the current rate while calling oraclize_query) depending on the datasource used and the proof chosen (see table below)
* a refund of the full gasLimit we are setting in the callback transaction (the minimum and default value is 200k gas)


| Datasource| Price/call (w/o proof)| Price/call (w/ proof) |
| :------- | ----: | :---: |
| URL| 1¢  |  5¢     |
| Blockchain| 1¢    |  5¢    |
| Wolfram Alpha| 3¢     | _|
