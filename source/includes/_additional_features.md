# Additional Features

## Parsing Helpers

In order to make things simpler to handle on the smart-contract side, you can provide the URL inside one of the following parsing helpers:

* `xml(..)` and `json(..)` helpers let you ask Oraclize to only return part of the JSON or XML-parsed response. 
For example:
 * in order to get the whole response back, you use the `URL` data-source with the URL argument `api.kraken.com/0/public/Ticker?pair=ETHUSD` 
 * but if all you want is the last-price field, you need to use the `json` parsing call as `json(api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0`

* `html(..).xpath(..)` helper is useful for html scraping. Just specify the <a href="https://en.wikipedia.org/wiki/XPath" target="_blank">XPATH</a> you want as `xpath(..)` argument. For Example:
 * to fetch the text of a specific tweet: `html(https://twitter.com/oraclizeit/status/671316655893561344).xpath(//*[contains(@class, 'tweet-text')]/text())`.

<aside class="notice">
Note:
Oraclize `json()` and `xpath()` helpers support respectively JSONPATH and XPATH standards. The JSONPATH implementation that we use is fully compatible with <a href="https://github.com/FlowCommunications/JSONPath#expression-syntax" target="_blank">FlowCommunications JSONPath 0.3.4</a>, which can be easily tested via <a href="https://jsonpath.curiousconcept.com/" target="_blank">this external website</a>. The XPATH implementation that we use is fully compatible with the <a href="https://www.w3.org/TR/xpath/" target="_blank">XPATH 1.0 standard</a>.
</aside>

* `binary(..)` helper is useful to get binary files such as certificate files
 * to fetch only a portion of the binary file you can use `slice(offset,length)` the first parameter is the offset while the second one is the length of the slice you want back (both in **bytes**).<br> example: fetch only the first 300 bytes from a binary CRL: `binary(https://www.sk.ee/crls/esteid/esteid2015.crl).slice(0,300)` **binary helper must be used with the slice option and only binary files (not encoded) are accepted**

<aside class="notice">
Note:
If and when the server is not responding or unreachable, we will send you an empty response
</aside>

## Encrypted Queries
There are some use cases where you are interested in not disclosing your clear text query to the blockchain: for example, if your query includes some API secret credentials.

One option is to encrypt the entire query using Oraclize public key `044992e9473b7d90ca54d2886c7addd14a61109af202f1c95e218b0c99eb060c7134c4ae46345d0383ac996185762f04997d6fd6c393c86e4325c469741e64eca9`

This means your request will be stored in the blockchain in an encrypted form and that only Oraclize will be able to decrypt it by using its paired private key.

To encrypt the query, you can use our `encrypted_queries_tools.py` python script (you can find it <a href="https://github.com/oraclize/encrypted-queries" target="_blank">here</a>).

The CLI command to encrypt an arbitrary string of text is then:

`python encrypted_queries_tools.py -e -p 044992e9473b7d90ca54d2886c7addd14a61109af202f1c95e218b0c99eb060c7134c4ae46345d0383ac996185762f04997d6fd6c393c86e4325c469741e64eca9 "YOUR QUERY"`

It will encrypt the query with the default Oraclize public key. You can then use the encrypted string to query Oraclize in an on-chain Ethereum smart contract.

```javascript
// here we specify the encrypted formula directly
oraclize_query("URL","AzK149Vj4z65WphbBPiuWQ2PStTINeVp5sS9PSwqZi8NsjQy6jJLH765qQu3U/bZPNeEB/bYZJYBivwmmREXTGjmKJk/62ikcO6mIMQfB5jBVVUOqzzZ/A8ecWR2nOLv0CKkkkFzBYp2sW1H31GI+SQzWV9q64WdqZsAa4gXqHb6jmLkVFjOGI0JvrA/Zh6T5lyeLPSmaslI");
```

```python
# here we specify the encrypted formula directly
oraclize_query("URL","AzK149Vj4z65WphbBPiuWQ2PStTINeVp5sS9PSwqZi8NsjQy6jJLH765qQu3U/bZPNeEB/bYZJYBivwmmREXTGjmKJk/62ikcO6mIMQfB5jBVVUOqzzZ/A8ecWR2nOLv0CKkkkFzBYp2sW1H31GI+SQzWV9q64WdqZsAa4gXqHb6jmLkVFjOGI0JvrA/Zh6T5lyeLPSmaslI");
```
In this case, we have encrypted the following string `json(https://poloniex.com/public?command=returnTicker).BTC_ETH.last`, which uses the JSON helper to parse the API response, but in the query you can specify any datasource and helper that you want. The example uses a public API, but you can use any private API that only require a secret user key authentication method. 

<aside class="notice">
You can also encrypt only 1 parameter of oraclize_query(), leaving the other ones in clear text
</aside>

The encryption method is also available for POST requests: you can encrypt both the URL and the POST data field as in the following example:

```javascript
// This is the query that we want to encrypt
oraclize_query("URL","json(https://api.postcodes.io/postcodes).status",'{"postcodes" : ["OX49 5NU", "M32 0JG", "NE30 1DP"]}')
```

```python
# This is the query that we want to encrypt
oraclize_query("URL","json(https://api.postcodes.io/postcodes).status",'{"postcodes" : ["OX49 5NU", "M32 0JG", "NE30 1DP"]}')
```

Encrypt the datasource (URL in this case):<br>
`python encrypted_queries_tools.py -e -p 044992e94... "URL"`

Result in: <br>
`BEIGVzv6fJcFiYQNZF8ArHnvNMAsAWBz8Zwl0YCsy4K/RJTN8ERHfBWtSfYHt+uegdD1wtXTkP30sTW+3xR3w/un1i3caSO0Rfa+wmIMmNHt4aOS`
<br>
<br>

Encrypt the argument(in this case we are using JSON parse helper to retrieve the "status" ):<br>
`python encrypted_queries_tools.py -e -p 044992e94... "json(https://api.postcodes.io/postcodes).status"`

Result in:<br>
`BNKdFtmfmazLLR/bfey4mP8v/R5zCIUK7obcUrF2d6CWUMvKKUorQqYZNu1YfRZsGlp/F96CAQhSGomJC7oJa3PktwoW5J1Oti/y2v4+b5+vN8yLIj1trS7p1l341Jf66AjaxnoFPplwLqE=`
<br>
<br>

Encrypt the JSON (third argument, the data to POST):<br>
`python encrypted_queries_tools.py -e -p 044992e94... '{"postcodes" : ["OX49 5NU", "M32 0JG", "NE30 1DP"]}'`

Result in:<br>
`BF5u1td9ugoacDabyfVzoTxPBxGNtmXuGV7AFcO1GLmXkXIKlBcAcelvaTKIbmaA6lXwZCJCSeWDHJOirHiEl1LtR8lCt+1ISttWuvpJ6sPx3Y/QxTajYzxZfQb6nCGkv+8cczX0PrqKKwOn/Elf9kpQQCXeMglunT09H2B4HfRs7uuI`
<br>
<br>

```javascript
// Finally we add all the encrypted text 
// to the oraclize_query (in the right order)
oraclize_query("BEIGVzv6fJcFiYQNZF8ArHnvNMAsAWBz8Zwl0YCsy4K/RJTN8ERHfBWtSfYHt+uegdD1wtXTkP30sTW+3xR3w/un1i3caSO0Rfa+wmIMmNHt4aOS","BNKdFtmfmazLLR/bfey4mP8v/R5zCIUK7obcUrF2d6CWUMvKKUorQqYZNu1YfRZsGlp/F96CAQhSGomJC7oJa3PktwoW5J1Oti/y2v4+b5+vN8yLIj1trS7p1l341Jf66AjaxnoFPplwLqE=","BF5u1td9ugoacDabyfVzoTxPBxGNtmXuGV7AFcO1GLmXkXIKlBcAcelvaTKIbmaA6lXwZCJCSeWDHJOirHiEl1LtR8lCt+1ISttWuvpJ6sPx3Y/QxTajYzxZfQb6nCGkv+8cczX0PrqKKwOn/Elf9kpQQCXeMglunT09H2B4HfRs7uuI")
```

```python
# Finally we add all the encrypted text
# to the oraclize_query (in the right order)
oraclize_query("BEIGVzv6fJcFiYQNZF8ArHnvNMAsAWBz8Zwl0YCsy4K/RJTN8ERHfBWtSfYHt+uegdD1wtXTkP30sTW+3xR3w/un1i3caSO0Rfa+wmIMmNHt4aOS","BNKdFtmfmazLLR/bfey4mP8v/R5zCIUK7obcUrF2d6CWUMvKKUorQqYZNu1YfRZsGlp/F96CAQhSGomJC7oJa3PktwoW5J1Oti/y2v4+b5+vN8yLIj1trS7p1l341Jf66AjaxnoFPplwLqE=","BF5u1td9ugoacDabyfVzoTxPBxGNtmXuGV7AFcO1GLmXkXIKlBcAcelvaTKIbmaA6lXwZCJCSeWDHJOirHiEl1LtR8lCt+1ISttWuvpJ6sPx3Y/QxTajYzxZfQb6nCGkv+8cczX0PrqKKwOn/Elf9kpQQCXeMglunT09H2B4HfRs7uuI")
```

Another use case may be a request from a datasource, as WolframAlpha, Bitcoin blockchain or IPFS. Our encryption system also permits users to encrypt any of the supported datasource option.

<aside class="notice">
In order to prevent the misuse of encrypted queries (i.e.: replay attacks) the first contract querying Oraclize with a specific encrypted query becomes its rightful owner. Any other contract reusing the exact same string will not be allowed to use it and will receive back an empty result.

As a consequence, remember to always generate a new encrypted string when re-deploying contracts using encrypted queries.
</aside>

### Chosen Encryption Scheme
To protect your encrypted queries, we have chosen an Elliptic Curve Integrated Encryption Scheme composed of the following algorithms:

* An Elliptic Curve Diffie-Hellman Key Exchange (ECDH), which uses secp256k1 as curve and ANSI X9.63 with SHA256 as Key Derivation Function. This algorithm is used to derive a shared secret from the Oraclize public key and the sender private key.
* The shared secret is used by an AES-256 in Galois Counter Mode (GCM), an authenticated symmetric cipher, to encrypt the query. The authentication tag is 16-bytes of length and the nonce is chosen to be '000000000000' (96 bits of length), which is safe because the shared secret is different for every encrypted query. We then return the concatenation of the encoded point (i.e the public key of the senders), the authentication tag and the encrypted text. The rationale for the chosen encryption scheme will be presented soon in a separated document.
