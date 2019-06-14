# Development Tools
In this section, developers will find some of tools which can assist them into integrating Provable in their product.

## Test Query

The <a href="https://app.oraclize.it/home/test_query" target="_blank">TestQuery</a> page can be used to test any Provable query. This does not require any code to be written and can be useful to verify the correctness of a given query during the early development stage.

## Network Monitor

The <a href="https://app.oraclize.it/service/monitor" target="_blank">Network Monitor</a>, along with the <a href="https://github.com/oraclize/proof-verification-tool" target="_blank">Proof Verification Tool</a>, can be used to verify the integrity and correctness of the authenticity proofs Provable has provided.

It is very important to independently verify that those proofs are valid, as this is the only way it can verified if Provable has ever provided a wrong answer.

## Encryption

In order to use the encryption-enabling features of Provable, developers can use the <a href="https://app.oraclize.it/home/test_query" target="_blank">TestQuery</a> page or the <a href="https://github.com/oraclize/encrypted-queries" target="_blank">Python Encryption Tool</a>. To avoid replay attacks, the encrypted query is linked to the first smart contract which uses it to perform a request to Provable. New deployment of the same smart contract code will required to newly encrypt the query.

## Remix IDE Provable Plugin
The Remix IDE is bundled with a variety of plugins, including one for using Provable as an oracle service. This plugin is intended for use with the JavaScript VM, which upon loading deploys all the needed infrastructure and listeners for your session. Thereafter you may deploy any contracts utilizing Provable via inheritance of the usingOraclize contract and track any query requests done through the plugin icon on the side panel of the IDE.

For some example contracts, please refer to the <a href="https://github.com/oraclize/ethereum-examples/tree/master/solidity" target="_blank">ethereum-examples</a> github repository. Contracts in the root directory like DieselPrice.sol and KrakenPriceTicker.sol are plug and play, in that you can simply run them in Remix with the plugin, and they will work.

<aside class="notice">
The plugin only works with the JavaScript VM environment on Remix, in the case of using a web3 provider or injected environment, the network in question will either need to be supported by Provable directly, which is true for for the public testnets or mainnet, or in the case of a private network, will require manual setup via the `ethereum-bridge`.
</aside>

## Unit Testing
An important step in smart contract development, before moving to an official testnet or production use, is unit testing. The Ethereum community has developed multiple frameworks for unit testing, such as Truffle and Embark, which can test contracts on a private instance of Ethereum. A common combination is to run Truffle tests in an ethereumjs-testrpc environments, which is a simulated Ethereum blockchain instance running in memory.
In order for Provable to interact with the smart contract deployed by Truffle or Embark in the test-rpc blockchain instance, a tool called Ethereum-Bridge need to be installed. This is a nodejs module which deploys in the instance the Provable smart contracts infrastructure which it is then monitored to see the requests. The tool translates the requests to HTTP API calls to the Provable Engine and then return the result by broadcasting the callback transaction. The Ethereum-Bridge and instructions on its deployment can be found <a href="https://github.com/oraclize/ethereum-bridge">here</a>.

## EthPM
The <a href="https://www.ethpm.com/">Ethereum Package Management</a> is a project which aims to standardize, build and maintain a common registry of smart contracts-based packages, to help smart contract developers.
Provable has published and maintains the Ethereum oraclizeAPI under the 'oraclize-api' package. To install it: `truffle install oraclize-api'.

<aside class="notice">
Please note that the correct package name is named `oraclize-api` and not `oraclize`.
</aside>

## Future

### Oraclize-lib

<a href="https://github.com/oraclize/oraclize-lib" target="_blank">Oraclize-lib</a> is an experimental nodejs library that be used to build non-blockchain applications leveraging Provable. It can be considered a simple abstraction layer to the Provable HTTP API.


### Stargate
The Provable team is working on a tool which will enable direct integration with any private deployment of Ethereum-based chain, including private testnet, without installing additional software. This tool has been named Stargate and it is under active development. The tool will consist of an ssh-bridge between the developer blockchain instance and Provable.
Additional information will be available later this year. Parties interested in trying this experimental feature, can get [in touch with us](mailto:info@oraclize.it).
