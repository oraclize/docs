# General Concepts

## Oraclize Engine
The Oraclize Engine internally replicates an "If This Then That" logical model. This means that it will execute a given set of instructions if some other given conditions are met. For example, it could repeatedly verify a condition and only return data or perform an action when the condition has been met. This flexiblity enables the engine to be can be leveraged in many different ways and contexts.


## Context Abstraction

To allow Oraclize to stay as context-generic as possible, Oraclize queries must specify both a datasource and a query text. The "datasource" field tells Oraclize where to look for your data. Available datasources include "URL", "WolframAlpha", "IFPS", and many others. The "query" field tells Oraclize what to fetch. An example URL query could be "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD" while an example WolframAlpha query could be "Who is the president of the US?"


## Parsing Helpers

In order to facilitate data post-processing, we supply simple to use (and audit) parsing helpers. This makes it easier to return only the necessary data and decrease on-chain processing cost and complexity. Note that authenticity proofs will still reference the full, original content.

The following parsing helpers are available:

* `xml(..)` and `json(..)` helpers let you return part of a JSON or XML-parsed response. 

For example, when querying the Kraken API:

 * in order to get the whole response back, you use the `URL` data-source with the URL argument `api.kraken.com/0/public/Ticker?pair=ETHUSD` 
 
 * but if all you want is the last-price field, you need to use the `json` parsing call as `json(api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0`

* `html(..).xpath(..)` helper is useful for html scraping. Just specify the <a href="https://en.wikipedia.org/wiki/XPath" target="_blank">XPATH</a> you want as `xpath(..)` argument. For example:
 * to fetch the text of a specific tweet: `html(https://twitter.com/oraclizeit/status/671316655893561344).xpath(//*[contains(@class, 'tweet-text')]/text())`.

<aside class="notice">
Note:
Oraclize `json()` and `xpath()` helpers support respectively JSONPATH and XPATH standards. The JSONPATH implementation that we use is fully compatible with <a href="https://github.com/FlowCommunications/JSONPath#expression-syntax" target="_blank">FlowCommunications JSONPath 0.3.4</a>, which can be easily tested via <a href="https://jsonpath.curiousconcept.com/" target="_blank">this external website</a>. The XPATH implementation that we use is fully compatible with the <a href="https://www.w3.org/TR/xpath/" target="_blank">XPATH 1.0 standard</a>.
</aside>

* `binary(..)` helper is useful to get binary files such as certificate files
 * to fetch only a portion of the binary file you can use `slice(offset,length)` the first parameter is the offset while the second one is the length of the slice you want back (both in **bytes**).<br> example: fetch only the first 300 bytes from a binary CRL: `binary(https://www.sk.ee/crls/esteid/esteid2015.crl).slice(0,300)` **binary helper must be used with the slice option and only binary files (not encoded) are accepted**

<aside class="notice">
Note:
When the server is not responding or is unreachable, or your parsing helper is not applicable, we will send you an empty response.
</aside>


## Authenticity Proofs

Oraclize is designed to act as an intermediary that you shouldn't have to trust. You can easily verify the authenticity of query data returned via authenticity proofs. You'll find more details on authenticity proofs in the "[#Security Deep Dive](#Security Deep Dive)" section.

<aside class="notice">
If Oraclize is unable to generate an authenticity proof for technical reasons, it will return in most cases the result without the requested proof. It is up to the developer to decide how to handle this case in their application: Oraclize recommends to discards the result and create a new query.
</aside>

## Data Privacy
Certain contexts, such as smart contracts on public blockchains, might require a level of privacy to protect data from public scrutiny. Developers can make encrypted Oraclize queries by encrypting a part (or all) of a query with the Oraclize public key.
More information can be found in the [Encrypted Queries](#Encrypted Queries) section.
