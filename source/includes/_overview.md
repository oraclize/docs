# Overview

Oraclize is a <u title="(the amount of trust involved is close to zero)">provably-honest oracle</u> service enabling smart contracts to access the Internet.

We are platform-agnostic and provide an abstraction interface to all the major smart-contracts-capable platforms out there (Bitcoin and Ethereum at the time of writing).
We think that it's just by throwing tons of meaningful data into the blockchain jar that the smart contracts industry can flourish and many useful applications can finally come to life.

While any platform is providing access to on-chain data only, Oraclize provides them with an interface to any data-feed on the Internet.

This documentation covers our API integration with the **Ethereum** platform.

The documentation covering our **HTTP API** and the **Bitcoin integration** are coming soon.


## Problem

Even though the oracle concept, in the blockchain sense, has been around for a while, we haven't seen any advanced implementations. All implementations were nothing more than proof of concepts or of very limited use in themselves.

One of the reasons for this failure to provide a proper oracle service is that trying to build a distributed oracle network where nodes attempt to find consensus to a specific query is very hard and needs a proper inter-oracle communication protocol (which Orisi was a first attempt to build) rather than merely a convincing incentive for the oracles not to lie.


## How does an oracle work

An oracle, in the blockchain sense, is a third party which sends to your on-chain smart contract some specific data your smart contract code cannot fetch by itself. As the oracle is a centralized party, you shouldn't take its response for granted.

For example, if you ask an oracle to give you the last trading price of ETH/USD the oracle needs to fetch this data from some exchanges on the Internet and than send this data back to you. While doing this the oracle might compromise the exchange data and send back to you a compromised value. This is the reason why, by itself, the oracle cannot be trusted. It is important to trust the data-feed provider (in our example this is the exchange trading the ETH/USD pair) but this can easily be mitigated by using different data-sources and using them to determine consensus.

However, how can we trust the oracle not to alter this data in the first place? This is achievable using the same mitigation technique we just explained above for data-sources or by using a cryptographic proof such as the TLSNotary one.


## Our solution

Oraclize wants to fill in this industry gap by providing an oracle service which is as generic as possible. We are not trying to build the Internet here but to provide a good compromise instead.

Although we are a centralized service we share the vision behind decentralized networks and we understand how reputation is key which is why we are providing a provably-honest service too.

![](images/flowchart.png)


