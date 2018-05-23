# General Concepts

Oraclize is integrated with a number of blockchain protocols and its service is useful and accessible also for non-blockchain applications. In the following section, general concepts which apply to all integrations will be explained.


## Oraclize Engine
The Oraclize Engine powers the service for both blockchain-based and non-blockchain-based application. Internally replicates an "If This Then That" logical model. This means that it will execute a given set of instructions if some other given conditions are met. For example, it could repeatedly verify a condition and only return data or perform an action when the condition has been met. This flexibility enables the engine to be leveraged in many different ways and contexts, even outside of the blockchain context.

A valid request for data to Oraclize, done via the native blockchain integration or via the HTTP API, should specify the following arguments:

* A data source type
* A query
* Optionally, an authenticity proof type


## Data Source Types

A data source is a trusted provider of data. It can be a website or web API such as Reuters, Weather.com, BBC.com, or a secure application running on an hardware-enforced Trusted Execution Environment (TEE) or an auditable, locked-down virtual machine instance running in a cloud provider. Oraclize currently offers the following types of native data sources:

* **URL**: enables the access to any webpage or HTTP API endpoint
* **WolframAlpha**: enables native access to WolframAlpha computational engine
* **IPFS**: provides access to any content stored on an IPFS file
* **random**: provides untampered random bytes coming from a secure application running on a Ledger Nano S.
* **computation**: provides the result of arbitrary computation

Additionaly, there also some meta data source such as:

* **nested**: enables the combination of different types of data source or multiple requests using the same data source, and it returns an unique result
* **identity**: it returns the query
* **decrypt**: it decrypts a string encrypted to the Oraclize private key


## Query
A query is an array of parameters which needs to evaluated in order to complete a specific data source type request: `query: [ parameter_1, parameters_2, ...];`

The first parameter is the main argument and it is usually mandatory. For example, in the case of the URL Data Source Type, the first argument is the expected URL where the resource resides. If only the first argument is present, then the URL Data Source assumes that an HTTP GET was requested. The second parameters, which it is optional, should contain the data payload of the HTTP POST request.

The intermediate result of a query may need to be parsed: for example, to extract a precise field in JSON API response. Therefore, the query can also specify parsing helpers to be applied.  

## Parsing Helpers
Oraclize offers XML, JSON, XHTML and a binary parser helpers. Examples:

* **JSON Parsing**: To extract the last-price field from the Kraken API, the fist parameter of the query `json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0`
* **XML Parser**:
* **HTML Parser**: helper is useful for HTML scraping. The desired <a href="https://en.wikipedia.org/wiki/XPath" target="_blank">XPATH</a> can be specified as argument of `xpath(..)`as shown in the example: `html(https://twitter.com/oraclizeit/status/671316655893561344).xpath(//*[contains(@class, 'tweet-text')]/text())`.
* **Binary Helper**: It can be useful to extract parts of a binary intermediate result by using the `slice(offset,length)` operator.
The first parameter is the expected to be the offset, while the second one is the length of the returned slice.
For example, `binary(https://www.sk.ee/crls/esteid/esteid2015.crl).slice(0,300)`returns the raw bytes of the first certificate of the linked certificate revocation list.  
**Binary helper must be used with the slice option and only raw binary inputs are accepted**

<aside class="notice">
Note:
Oraclize `json()` and `xpath()` helpers support respectively JSONPATH and XPATH standards. The JSONPATH implementation is fully compatible with <a href="https://github.com/FlowCommunications/JSONPath#expression-syntax" target="_blank">FlowCommunications JSONPath 0.3.4</a>, which can be easily tested via <a href="https://jsonpath.curiousconcept.com/" target="_blank">this external website</a>. The XPATH implementation that we use is fully compatible with the <a href="https://www.w3.org/TR/xpath/" target="_blank">XPATH 1.0 standard</a>.
</aside>

## Authenticity Proofs
Oraclize is designed to act as an untrusted intermediary. Optionally, a request to Oraclize can specify an authenticity proof. Not all proofs are compatible with all data source types. More details on the authenticity proofs can be found in the "[Security Deep Dive](##security-deep-dive)" section.

<aside class="notice">
Always use https:// calls when working with authenticity proofs, otherwise your request might get tampered with during the process (MITM attacks) and no detection of such attacks would be possible.
</aside>

<aside class="notice">
If Oraclize is unable to generate an authenticity proof for technical reasons, it will return in most cases the result without the requested proof. It is up to the developer to decide how to handle this case in their application: Oraclize recommends to discards the result and create a new query.
</aside>

## Data Privacy
Certain contexts, such as smart contracts on public blockchains, might require a level of privacy to protect data from public scrutiny. Developers can make encrypted Oraclize queries by encrypting an entire query or some of its arguments with the Oraclize public key.
More information can be found in the [Encrypted Queries](#ethereum-advanced-topics-encrypted-queries) section.
