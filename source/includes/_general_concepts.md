# General Concepts

## If this then that

The Oraclize engine internally replicates "If This Then That" logic. This means that it will execute a given set of instructions if some other given conditions are met. For example, you might want to repeatedly verify and return some data every x seconds. This is very generic and can be leveraged in many different ways.

## Context abstraction

To allow Oraclize to stay as context-generic as possible, Oraclize queries must specify both a datasource and a query text. The "datasource" field tells Oraclize where to look for your data. Available datasources include "URL", "WolframAlpha", "IFPS", and many others. The "query" field tells Oraclize what to fetch. An example URL query could be "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD" while an example WolframAlpha query could be "Who is the president of the US?"

## Data and computations

Thanks to our context-generic implementation, your queries don't necessarily need to be to Web APIs. You can query other blockchains, IPFS, WolframAlpha, and much more. You'll find a list of supported datasources in the dedicated "Datasources" section.  

## Examples

Given the above, you can ask things like:

* datasource: `WolframAlpha`, query: `who is the president of the US?`
* datasource: `URL`, query: `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD` 

## Parsing helpers

In ordet to facilitate data post-processing, we supply simple to use (and audit) parsing helpers. This makes it easier to return only the necessary data and decrease on-chain processing cost and complexity. Note that authenticity proofs will still reference the full, original content.

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

Oraclize is designed to act as an intermediary that you shouldn't have to trust. You can easily verify the authenticity of query data returned via authenticity proofs. You'll find more details on authenticity proofs in the "Security Deep-dive" section.

<aside class="notice">
If Oraclize is unable to generate an authenticity proof (for technical reasons), it will return the result without the requested proof. It is up to the developer to decide how to handle this case. The result can be accepted, but it is recommended that the query be retried.
</aside>

## Data Privacy

Certain contexts, such as smart contracts on public blockchains, might require a level of privacy to protect data from public scrutiny. Developers can make encrypted Oraclize queries by encrypting a part (or all) of a query with the Oraclize public key.

## Encrypted Queries

Developers might be interested in keeping part (or all) of their queries private. For example, you might want to keep an API key secret from the rest of a public blockchain.

One option is to encrypt the entire query using Oraclize public key `044992e9473b7d90ca54d2886c7addd14a61109af202f1c95e218b0c99eb060c7134c4ae46345d0383ac996185762f04997d6fd6c393c86e4325c469741e64eca9`

This means your request will be encrypted before being stored in the blockchain, and that only Oraclize will be able to decrypt your request using its paired private key. 

To encrypt the query, you can use our `encrypted_queries_tools.py` python script (you can find it <a href="https://github.com/oraclize/encrypted-queries" target="_blank">here</a>).

The CLI command to encrypt an arbitrary string of text is then:

`python encrypted_queries_tools.py -e -p 044992e9473b7d90ca54d2886c7addd14a61109af202f1c95e218b0c99eb060c7134c4ae46345d0383ac996185762f04997d6fd6c393c86e4325c469741e64eca9 "YOUR QUERY"`

This will encrypt the query with the default Oraclize public key. You could then use the encrypted string to query Oraclize in an on-chain Ethereum smart contract.

```javascript
// here we specify the encrypted formula directly
oraclize_query("URL","AzK149Vj4z65WphbBPiuWQ2PStTINeVp5sS9PSwqZi8NsjQy6jJLH765qQu3U/
  bZPNeEB/bYZJYBivwmmREXTGjmKJk/62ikcO6mIMQfB5jBVVUOqzzZ/A8ecWR2nOLv0CKkkkFzBYp2sW1H
  31GI+SQzWV9q64WdqZsAa4gXqHb6jmLkVFjOGI0JvrA/Zh6T5lyeLPSmaslI");
```

In this case, we have encrypted the following string `json(https://poloniex.com/public?command=returnTicker).BTC_ETH.last`, which uses the JSON helper to parse the API response, but in the query you can specify any datasource and helper that you want. The example uses a public API, but you can use any private API that only require a secret user key authentication method. 

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

### Chosen Encryption Scheme
To protect your encrypted queries, we have chosen an Elliptic Curve Integrated Encryption Scheme composed of the following algorithms:

* An Elliptic Curve Diffie-Hellman Key Exchange (ECDH), which uses secp256k1 as curve and ANSI X9.63 with SHA256 as Key Derivation Function. This algorithm is used to derive a shared secret from the Oraclize public key and the sender private key.
* The shared secret is used by an AES-256 in Galois Counter Mode (GCM), an authenticated symmetric cipher, to encrypt the query. The authentication tag is 16-bytes of length and the nonce is chosen to be '000000000000' (96 bits of length), which is safe because the shared secret is different for every encrypted query. We then return the concatenation of the encoded point (i.e the public key of the senders), the authentication tag and the encrypted text. The rationale for the chosen encryption scheme will be presented soon in a separate document.
