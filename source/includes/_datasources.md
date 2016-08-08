# Datasources

We list here the data-sources you can choose from when using our oracle service.

<table>
  <tr>
    <th rowspan="3" style="vertical-align: bottom !important;">Datasource</th>
    <th colspan="3">Distributions</th>
    <th colspan="2" rowspan="2" style="vertical-align: bottom !important;">Proof type</th>
  </tr>
  <tr>
    <td rowspan="2">Ethereum Mainnet<br></td>
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
