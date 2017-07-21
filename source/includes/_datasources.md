# Data Sources

Listed here are the data-sources you can choose from when using our oracle service.<br>Please note that datasource selection is <i>not</i> case-sensitive.


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
    <td>Android</td>
    <td>Ledger</td>
  </tr>
  <tr>
    <td><a href="#datasources-url">URL</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="#datasources-random">Random</a></td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>✓</td>
  </tr>
  <tr>
    <td><a href="#datasources-wolframalpha">WolframAlpha</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="#datasources-blockchain">Blockchain</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="#datasources-ipfs">IPFS</a><sup> 1</sup></td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="#datasources-decrypt">decrypt</a></td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="#datasources-nested">nested</a><sup> 1</sup></td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓<sup> 3</sup></td>
    <td>✓</td>
    <td>✓</td>
  </tr>
  <tr>
    <td><a href="#datasources-computation">computation</a><sup> 1</sup></td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>✓</td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
</table>



<sup> 1</sup> Still experimental

<sup> 2</sup> Still experimental, will be available on mainnet once it's stable

<sup> 3</sup> Depending on the datasources you choose in sub-queries, proofs may be provided for each of them, but not for the aggregation itself

## URL

The most generic data-source we provide is the `URL` one, which can be used to access any public API or page on the Internet.
As a first step you need to provide the actual URL whose HTTP `GET` / `POST` output you want Oraclize to fetch; and optionally the query-string parameters. Oraclize will forward you the response, while optionally attaching the ``TLSNotary`` proof.

## WolframAlpha

The `WolframAlpha` data-source lets you specify as an argument a query to submit to the WolframAlpha knowledge engine. Oraclize will send you back the primary response as a string if any.

<aside class="notice">
There may not always be a primary response for your query, please test your query in advance on our Web IDE widget to make sure your syntax makes sense to Wolfram's engine.
</aside>
<aside class="notice">
Note:
With this data-source we will not give you back the `TLSNotary` proof as returning the whole API response is against WolframAlpha Terms of Service.
</aside>


## IPFS

The `IPFS` data-source can be used to retrieve the content of a file on the IPFS protocol.

This datasource expects you to specify the IPFS multihash in the query i.e. `QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o` will return `"hello world\n"` (note that in this case we have a terminating new line because the original IPFS file had it).

Please note that if we fail to fetch the IPFS content within <i>20</i> seconds, the request will fail.

## decrypt

Even though the `decrypt` datasource can be used as any other, it was specifically designed to be used within the <a href="#datasources-nested">`nested`</a> datasource to enable partial query encryption.


The result is the decrypted query string. **Please note that all the logic, limitations and tools provided by the `Encryption` feature apply here as well.**

## nested
The `nested` datasource is a meta datasource, it does not provide access to additional services. It was designed to provide some simple aggregation logic, enabling a single query to leverage sub-queries based on any available datasource and produce a single stringas a result.


The `query` format is built in a way you that you can specify a sub-datasource and a sub-query as follows: `[datasource_name] query_content`.

Please mind the square brackets delimiting the datasource name and the whitespace prefixing the actual sub-query. The sub-query content can optionally be delimited by either single or double quotes.


You can optionally specify more than one sub-query, by using as delimitators the `${` special opener and the `}` special closer.

Example: `[WolframAlpha] temperature in ${[IPFS] QmP2ZkdsJG7LTw7jBbizTTgY1ZBeen64PqMgCAWz2koJBL}`

```javascript
oraclize_query("nested", "[URL] ['json(https://api.random.org/json-rpc/1/invoke).result.random.data.0', '\\n{\"jsonrpc\":\"2.0\",\"method\":\"generateSignedIntegers\",\"params\":{\"apiKey\":${[decrypt] BIm/tGMbfbvgqpywDDC201Jxob7/6+sSkRBtfCXN94GO0C7uD4eQ+aF+9xNJOigntWu8QHXU6XovJqRMEGHhnEnoaVqVWSqH1U1UFyE6WySavcbOb/h8hOfXv+jYBRuhkQr+tHXYrt1wx0P0dRdeCxbLp1nDuq8=},\"n\":1,\"min\":1,\"max\":10000${[identity] \"}\"},\"id\":1${[identity] \"}\"}']", ORACLIZE_GAS_LIMIT + safeGas);
```

## computation

![](http://i.imgur.com/BPneTYH.png)

The `computation` datasource enables the auditable execution of an application or a script by leveraging a sandboxed Amazon Web Service virtual machine. 

The application has to print, on standard output, the result of the computation as the last line before it quits. The result can be up to 2500 characters long. The execution context has to be described by a <a href="https://docs.docker.com/engine/reference/builder/" target="_blank">Dockerfile</a>, where building and running it should start the main application straight away. Currently Oraclize only provides one type of auditable instance: a t2.micro instance.  The Dockerfile initialization and application execution should terminate as soon as possible, as the execution time is capped at 5 minutes.

The developer can send to Oraclize the application binary or the script, its dependency and the Dockerfile by creating an archive and uploading it to IPFS.
The query expects as first argument the IPFS multihash of that archive, while the following arguments will be passed to the execution environment as environmental variables, making them accessible by the application. 


Example:

1. Dockerfile content:

<textarea disabled style="padding:5px;width:490px;height:104px;background-color: #333;color:#FFF;border:none;">
FROM ubuntu:14.04
MAINTAINER Oraclize "info@oraclize.it"
RUN apt-get update && apt-get install -y python-numpy
CMD python -c "import numpy; print int(numpy.linalg.det(numpy.array([[1,2,3],[7,2,3],[7,6,3]])))"</textarea>

2. `zip -r `<a href="http://ipfs.io/ipfs/QmRxtL9K2de7v7QBYCCrwcjZHjYmuKggZ8xaqZ6UUWvd1s" target="_blank">`archive.zip`</a>` .`

3. `ipfs add archive.zip`
 * Output: `added QmRxtL9K2de7v7QBYCCrwcjZHjYmuKggZ8xaqZ6UUWvd1s archive.zip`

4. The query argument is `QmRxtL9K2de7v7QBYCCrwcjZHjYmuKggZ8xaqZ6UUWvd1s` and the query result will be `72`

<aside class="notice">
Note: if you choose to specify a MAINTAINER in the Dockerfile, we might use the email address specified there to contact you in case any issue arises.
</aside>


## random

The design described there prevents Oraclize from tampering with the random results coming from the Trusted Execution Envirnment (TEE) and protects the user from a number of attack vectors.

The authenticity proof, attached with the result, can be easily verified not just off-chain but even by any Solidity contract receiving them. <a href="https://github.com/oraclize/ethereum-examples/tree/master/solidity/random-datasource" target="_blank">The example presented here</a>, showing how to integrate the verification process, discards any random result whose authenticity proofs don't pass the verification process.

The random datasource is leveraging the Ledger proof to prove that the origin of the generated randomness is really a secure Ledger device.

The rationale behind this method of securely feeding off-chain randomness into the blockchain is explained in the <a target="_blank" href="http://www.oraclize.it/papers/random_datasource-rev1.pdf">“A Scalable Architecture for On-Demand, Untrusted Delivery of Entropy”</a> whitepaper.


