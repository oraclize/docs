# Data Sources

Listed here are the data-sources you can choose from when using our oracle service.<br>Please note that datasource selection is <i>not</i> case-sensitive.


<table>
  <tr>
    <td></td>
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
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="#datasources-random">Random</a></td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>✓</td>
  </tr>
  <tr>
    <td><a href="#datasources-wolframalpha">WolframAlpha</a></td>
    <td>✓</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="#datasources-ipfs">IPFS</a><sup> 1</sup></td>
    <td>✓</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td><a href="#datasources-computation">computation</a><sup> 1</sup></td>
    <td>✓</td>
    <td>✓</td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
</table>


## URL

The `URL` data source type enables access to any API or web page on the Internet. It supports both HTTP GET and HTTP POST request.
If only one parameters is specified in the query, the service will default to perform an HTTP GET request. If a second parameter is specified, then the service will perform an HTTP POST request, posting the second parameter as data. Note that if the second parameter is valid JSON, then it will be posted as such. The `URL` data source type supports TLSNotary Proofs and Android Proofs.
More advanced HTTP capabilities, such as Basic Authentication or OAuth, can be build by leveraging the `computation` data source type.

<aside class="notice">
As Oraclize is a remote service, it requires the `URL` datasource to also be remotely accessible. In case a developer may wish to use an API that is accessible only on their local network, they may use the `localtunnel` utility available via `npm` to expose their local port via a publicly accessible url (which is what is to be used as the query parameter, in place of localhost:8080 or 127.0.0.1). More information on this utility is available at: <a href="https://localtunnel.github.io/www/" target="_blank">https://localtunnel.github.io/www/</a>
</aside>

## WolframAlpha

The `WolframAlpha` data source type enables direct access to the WolframAlpha Knowledge Engine API. This datasource expects as sole parameter the string which should be passed to WolframAlpha. It will returns the result as a string.

<aside class="notice">
Developers should test the validity of the query via Oraclize's Test Page to make sure your syntax makes sense to Wolfram's engine.
</aside>
<aside class="notice">
This data source doesn't support authenticity proofs as returning the whole API response is against WolframAlpha Terms of Service. For this reason, Oraclize recommends to use this data source type only for testing.
</aside>


## IPFS

The `IPFS` data source type can be used to retrieve the content of a file on the IPFS network.

This datasource expects as sole parameter the IPFS multihash in the query. For example, the file `QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o` would return `"hello world\n".

If Oraclize fails to fetch the IPFS content within <i>20</i> seconds, the request will fail.

## computation

```shell
# Content of the Dockerfile

FROM ubuntu:14.04
MAINTAINER Oraclize "info@oraclize.it"
RUN apt-get update && apt-get install -y python-numpy
CMD python -c "import numpy; print int(numpy.linalg.det(numpy.array([[1,2,3],[7,2,3],[7,6,3]])))"
```

```shell
# How to create the zip archive and upload it on IPFS
user@locahost:~$ zip -r archive.zip
user@locahost:~$ ipfs add archive.zip
added QmRxtL9K2de7v7QBYCCrwcjZHjYmuKggZ8xaqZ6UUWvd1s archive.zip
```
The `computation` datasource enables the auditable execution of an application or a script by leveraging a sandboxed Amazon Web Service virtual machine.

The application has to print, on standard output, the result of the computation as the last line before it quits. The result can be up to 2500 characters long. The execution context has to be described by a <a href="https://docs.docker.com/engine/reference/builder/" target="_blank">Dockerfile</a>, where building and running it should start the main application straight away. Currently Oraclize only provides one type of auditable instance: a t2.micro instance.  The Dockerfile initialization and application execution should terminate as soon as possible, as the execution time is capped at 5 minutes.

The developer can send to Oraclize the application binary or the script, its dependency and the Dockerfile by creating an archive and uploading it to IPFS.
The query expects as first argument the IPFS multihash of that archive, while the following arguments will be passed to the execution environment as environmental variables, making them accessible by the application.


<aside class="notice">
Oraclize might use the email specified in the MAINTAINER field of the Dockerfile, as contact information in case any issue arises.
</aside>

## random

The design described there prevents Oraclize from tampering with the random results coming from the Trusted Execution Environment (TEE) and protects the user from a number of attack vectors.

The authenticity proof, attached with the result, can be easily verified not just off-chain but even by any Solidity contract receiving them. <a href="https://github.com/oraclize/ethereum-examples/tree/master/solidity/random-datasource" target="_blank">The example presented here</a>, showing how to integrate the verification process, discards any random result whose authenticity proofs don't pass the verification process.

The random datasource is leveraging the Ledger proof to prove that the origin of the generated randomness is really a secure Ledger device.

The rationale behind this method of securely feeding off-chain randomness into the blockchain is explained in the <a target="_blank" href="http://www.oraclize.it/papers/random_datasource-rev1.pdf">“A Scalable Architecture for On-Demand, Untrusted Delivery of Entropy”</a> white paper.


## decrypt

Even though the `decrypt` datasource can be used as any other, it was specifically designed to be used within the <a href="#datasources-nested">`nested`</a> datasource to enable partial query encryption.


The result is the decrypted query string. **Please note that all the logic, limitations and tools provided by the `Encryption` feature apply here as well.**

## nested
The `nested` datasource is a meta datasource, it does not provide access to additional services. It was designed to provide some simple aggregation logic, enabling a single query to leverage sub-queries based on any available datasource and produce a single string as a result.


The `query` format is built in a way you that you can specify a sub-datasource and a sub-query as follows: `[datasource_name] query_content`.

Please mind the square brackets delimiting the datasource name and the whitespace prefixing the actual sub-query. The sub-query content can optionally be delimited by either single or double quotes.


You can optionally specify more than one sub-query, by using as delimitators the `${` special opener and the `}` special closer.

Example: `[WolframAlpha] temperature in ${[IPFS] QmP2ZkdsJG7LTw7jBbizTTgY1ZBeen64PqMgCAWz2koJBL}`
