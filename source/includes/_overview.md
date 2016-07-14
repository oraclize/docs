# Overview

Even though the oracle concept, in the blockchain sense, has been around for a while, we haven't seen any advanced implementations. All implementations were nothing more than proof of concepts or of very limited use in themselves.

One of the reasons for this failure to provide a proper oracle service is that trying to build a distributed oracle network where nodes attempt to find consensus to a specific query is very hard and needs a proper inter-oracle communication protocol (which Orisi was a first attempt to build) rather than merely a convincing incentive for the oracles not to lie.

Oraclize wants to fill in this industry gap by providing an oracle service which is as generic as possible. We are not trying to build the Internet here but to provide a good compromise instead.

Although we are a centralized service we share the vision behind decentralized networks and we understand how reputation is key which is why we are providing a provably-honest service too.


## How does an oracle work

An oracle, in the blockchain sense, is a third party which sends to your on-chain smart contract some specific data your smart contract code cannot fetch by itself. As the oracle is a centralized party, you shouldn't take its response for granted.

For example, if you ask an oracle to give you the last trading price of ETH/USD the oracle needs to fetch this data from some exchanges on the Internet and than send this data back to you. While doing this the oracle might compromise the exchange data and send back to you a compromised value. This is the reason why, by itself, the oracle cannot be trusted. It is important to trust the data-feed provider (in our example this is the exchange trading the ETH/USD pair) but this can easily be mitigated by using different data-sources and using them to determine consensus.

However, how can we trust the oracle not to alter this data in the first place? This is achievable using the same mitigation technique we just explained above for data-sources or by using a cryptographic proof such as the TLSNotary one.


## TLSNotary proof

Since we understand you may not trust our service to provide you with the correct data, we optionally send you a cryptographic proof showing that we didn't alter the data coming from your chosen data-source.

TLSNotary is a tool, built on top of TLS/SSL, by which you can prove that a certain server has really sent some data to you at a certain time. By attaching the TLSNotary proof to the results we are providing you, you can be 100% sure that we are not lying and that our response is indeed coming from a certain server at a specific time.


# Datasources

We list here the data-sources you can choose from when using our oracle service.

<table>
  <tr>
    <th rowspan="3" style="vertical-align: bottom !important;">Datasource</th>
    <th colspan="3">Distributions</th>
    <th colspan="2" rowspan="2" style="vertical-align: bottom !important;">Proof type</th>
  </tr>
  <tr>
    <td rowspan="2">Ethreum Mainnet<br></td>
    <td rowspan="2">Ethereum Morden</td>
    <td rowspan="2">HTTP API</td>
  </tr>
  <tr>
    <td>None</td>
    <td>TLSNotary</td>
  </tr>
  <tr>
    <td><a href="#url">URL</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td><a href="#blockchain">Blockchain</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td><a href="#wolfram-alpha">Wolfram Alpha</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="#ipfs">IPFS</a></td>
    <td>N/A*</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>N/A</td>
  </tr>
</table>

*Still experimental, will be available on mainnet once it's stable


## URL 

The most generic data-source we provide is the `URL` one, which can be used to access any public API or page on the Internet.
As a first step you need to provide the actual URL whose HTTP `GET` / `POST` output you want Oraclize to fetch; and optionally the query-string parameters. Oraclize will forward you the response, while optionally attaching the ``TLSNotary`` proof.

#### Parsing helpers

In order to make things simpler to handle on the smart-contract side, you can provide the URL inside one of the following parsing helpers:

* `xml(..)` and `json(..)` helpers let you ask Oraclize to only return part of the JSON or XML-parsed response. 
For example:
 * in order to get the whole response back, you use the `URL` data-source with the URL argument `api.kraken.com/0/public/Ticker?pair=ETHUSD` 
 * but if all you want is the last-price field, you need to use the `json` parsing call as `json(api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0`

* `html(..).xpath(..)` helper is useful for html scraping. Just specify the <a href="https://en.wikipedia.org/wiki/XPath" target="_blank">XPATH</a> you want as `xpath(..)` argument. For Example:
 * to fetch the text of a specific tweet: `html(https://twitter.com/oraclizeit/status/671316655893561344).xpath(//*[contains(@class, 'tweet-text')]/text())`.

<aside class="notice">
	Note:
	Oraclize `json()` and `xpath()` helpers support respectively JSONPATH and XPATH standards
</aside>

* `binary(..)` helper is useful to get binary files such as certificate files
 * to fetch only a portion of the binary file you can use `slice(offset,length)` the first parameter is the offset while the second one is the length of the slice you want back (both in **bytes**).<br> example: fetch only the first 300 bytes from a binary CRL: `binary(https://www.sk.ee/crls/esteid/esteid2015.crl).slice(0,300)` **binary helper must be used with the slice option and only binary files (not encoded) are accepted**

> **Note:**
> If and when the server is not responding or unreachable, we will send you an empty response

## Wolfram Alpha

The `WolframAlpha` data-source lets you specify as argument a query to submit to the Wolfram Alpha knowledge engine. Oraclize will send you back the primary response as a string if any.

> **Note:**
> There may not always be a primary response for your query, please test your query in advance on our Web IDE widget to make sure your syntax makes sense to Wolfram's engine.

<aside class="notice">
Note:
With this data-source we will not give you back the `TLSNotary` proof as returning the whole API response is against Wolfram Alpha Terms of Service.
</aside>


## Blockchain

The `Blockchain` data-source provides you with easy access to blockchain-related data. You can see this data-source as a shortcut to common block explorer APIs, but with a built-in easy-to-use syntax.
Possible query arguments are:

* `bitcoin blockchain height`,
* `litecoin hashrate`,
* `bitcoin difficulty`, 
* `1NPFRDJuEdyqEn2nmLNaWMfojNksFjbL4S balance` 
and so on.


## IPFS

The `IPFS` data-source can be used to retrieve the content of a file on the IPFS protocol, just specify the IPFS multihash in the query i.e. `QmdEJwJG1T9rzHvBD8i69HHuJaRgXRKEQCP7Bh1BVttZbU` will return `"ciao\n"` (note the new line on the original IPFS file)
