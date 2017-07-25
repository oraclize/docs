# Development Tools

## Test query

The <a href="https://app.oraclize.it/home/test_query" target="_blank">TestQuery</a> page can be used to test any Oraclize query. This does not require any code to be written and can be useful to verify the correctness of a given query during the early development stage.

## Network Monitor

The <a href="https://app.oraclize.it/service/monitor" target="_blank">Network Monitor</a>, along with the <a href="https://github.com/oraclize/proof-verification-tool" target="_blank">Proof Verification Tool</a>, can be used to verify the integrity and correctness of the authenticity proofs Oraclize has provided.

It is very important to independently verify that those proofs are valid, as this is the only way you can verify if Oraclize has ever provided a wrong answer.

## Encryption

In order to use the encryption-enabling features of Oraclize, developers can use the <a href="https://app.oraclize.it/home/test_query" target="_blank">TestQuery</a> page or the <a href="https://github.com/oraclize/encrypted-queries" target="_blank">Python Encryption Tool</a>. Keep in mind that every time you need to use the same encrypted content in a different Oraclize context (like a different Ethereum contract or a different Oraclize contract), you will need to generate and use a different encrypted string; this is to prevent replay attacks.

## Stargate

Stargate will enables direct integration with your private deployment of an Ethereum-based chain, including testnets. It will

If you need to use Oraclize in a private testnet, the Stargate tool enables a full integration of the service in your private context. You can find more information on how to use it in the dedicated section of the documentation. 

## Browser-solidity

The <a href="http://dapps.oraclize.it/browser-solidity/" target="_blank">Oraclize browser-solidity</a> plugin enables you to test Ethereum Oraclize-based contracts straight from your browser (in "VM mode"), with no need for you to install or setup anything. This is a very handy tool to use fo development.


## Truffle & ethpm

When testing your Oraclize-based contracts with Truffle, you can fully benefit from our ethpm integration and download the oraclizeAPI Solidity contract just by typing `truffle install oraclize`.

## Oraclize-lib

<a href="https://github.com/oraclize/oraclize-lib" target="_blank">Oraclize-lib</a> is a nodejs library that you can use to build applications based on top of the Oraclize service. Note that this isn't dependant on a blockchain in any way and therefore could be integrated into any service!
