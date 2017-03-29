# Development Tools

## Test query

The <a href="https://app.oraclize.it/home/test_query" target="_blank">TestQuery</a> page can be used to test any Oraclize query. This does not require any code to be written and can be useful to verify the correctness of a given query during the early development stage.

## Network Monitor

The <a href="https://app.oraclize.it/service/monitor" target="_blank">Network Monitor</a>, along with the <a href="https://github.com/oraclize/proof-verification-tool" target="_blank">Proof Verification Tool</a>, can be used to verify the integrity and correctness of the authenticity proofs Oraclize has provided.

It is very important to verify independently that those proofs are valid, as this is the only way you can verify if Oraclize has ever provided a wrong answer.

## Encryption

In order to use the encryption-enabling features of Oraclize, you can use tools like the <a href="https://app.oraclize.it/home/test_query" target="_blank">TestQuery</a> page or the <a href="https://github.com/oraclize/encrypted-queries" target="_blank">Python Encryption Tool</a>. Keep in mind that every time you need to use the same encrypted content in a different Oraclize context (like a different Ethereum contract or a different Oraclize contract), you will need to generate and use a different encrypted string; this is to prevent replay attacks.

## Stargate

If you need to use Oraclize in a private testnet, the Stargate tool enables a full integration of the service in your private context. You can find more information on how to use it in the dedicated section of the documentation. 

## Browser-solidity

The <a hre"http://dapps.oraclize.it/browser-solidity/" target="_blank">Oraclize</a> browser-solidity plugin enables you to test Ethereum Oraclize-based contracts straight from your browser (in "VM mode"), with no need for you to install or setup anything. This is a very handy tool to use fo development.

## Ethereum Studio plugin

If you are familiar with the  <a hre"https://live.ether.camp" target="_blank">Ethereum-Studio IDE</a>, you can follow the short tutorial Ether-camp provides to enable the Oraclize plugin and test your Oraclize-based contracts straight from there.

## Truffle & ethpm

When testing your Oraclize-based contracts with Truffle, you can fully benefit from our ethpm integration and use download the oraclizeAPI Solidity contract by just typing `ethpm install oraclize`.

## Oraclize-lib

<a href="https://github.com/oraclize/oraclize-lib" target="_blank">Oraclize-lib</a> is an handy nodejs library that you can use to build applications based on the top of the Oraclize service. Note that this is no dependant to the blockchain in any way!
