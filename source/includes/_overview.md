# Overview

> ![](images/flowchart.png)

Oraclize aims to be the preeminent data carrier between blockchain protocols and the wider Internet. 

The Oraclize service allows smart contracts to break free from their constraints by providing a trustless way to access data from the web.

Smart contract developers should not have to blindly trust Oraclize to securely and accurately transmit the data they need. Oraclize provides a proof of authenticity along with the data requested to prove that the data was transmitted untampered from the provider defined by the smart contract.

A more detailed overview of Oraclize authenticity proofs is provided in the Authenticity Proofs section of this documentation.

##  What is an oracle?

In a nutshell, an oracle is something (or someone) that provides data to blockchain applications that these applications cannot (efficiently) access by themselves. 

Oracles are necessary because it is inefficient and often impossible to reach a decentralized consensus on centralized data.

##  What is Oraclize?

Oraclize is an elegant solution to the "oracle problem" and is the "state-of-the-art" oracle service. We allow blockchain applications to easily and efficiently access data from any datasource (ex. Web APIs).

This means that existing datasources can be used without needing to adapt them for the blockchain and can continue providing data via existing channels (typically a Web API). 

Oraclize can be seen as an intermediary in a world designed to exist without intermediaries. While this can be seen as a "weakness", it actually provides significant benefits. The following Rationale section details why we designed the system in this way and why this approach is so powerful

##  Rationale

When desiging Oraclize, we initally considered reiterating the concepts of decentralized oracle systems like Orisi. We soon realized that the limitations of the decentralized approach make it basically unacceptable. Our core design philosophy required that existing datasources not have to adapt to or even understand the blockchain. We felt it was important to ensure that the datasource and oracle components of the service were separated. Our approach allows blockchain applications to interact with any datasource via standard channels, out of the box. Oraclize authenticity proofs provide strong guarantees regarding the authenticity of the data. Applications can be 100% certain that requested data is being transmitted, without modifications, from the datasource it was requested from.

##  Integrations

Thanks to our model, you can easily leverage our service from multiple contexts. Currently, Oraclize can be used from Ethereum, Eris, Rootstock, Bitcoin, and from any non-blockchain application. As the state-of-the-art oracle service for both public and private blockchains, Oraclize can be used without limitations in pretty much any context.
