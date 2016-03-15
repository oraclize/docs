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


