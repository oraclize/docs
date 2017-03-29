# Overview
Oraclize aims to be the privileged data gateway between blockchain protocols and the world wide web. 

Oraclize main goal as a company is to provide a way for smart contracts to break free of their constrains and provide them the ability to access all the data they need from the web, without compromising their trustless nature. 

In particular, the aim is not to force smart contract developers in having to trust Oraclize with the data they need. Without any backing of authenticity, Oraclize could easily tamper with the data.

In order to complete this complex task, Oraclize returns the data requested along with a proof of the authenticity: i.e that the data comes from the data provider which has been explicity demanded by the smart contract.

More can be read about the authenticity proofs provided by Oraclize, within the dedicated Authencity Proofs section of this documentation.


##  What is an oracle

There are many different definitions of oracle, according to the one we stick with an oracle is the blockchain-aware party in charge of providing on the blockchain some data that blockchain applications cannot access by themselves due to technical limitations.

##  What is Oraclize

Oraclize is an elegant solution to the "oracle problem". We are the "state-of-the-art" oracle service and we enable any datasource (Web APIs, ..) to be used straight away from different blockchain applications, without needing the datasources to adapt or understand the blockchain.

##  Rationale

We do not find reasonable the idea that datasources should adapt to the blockchain and send their data there by themselves. Thanks to our approach, any datasource can be used out of the box in any context, while removing all the potential risks of putting an extra intermediary into the game. The authenticity proofs we provide can give strong guarantees around the authenticity of data. This means that while the data is sent to the blockchain by us, you can be 100% sure that it is coming, without modifications, from the datasource you have chosen.

##  Integrations

Thanks to our model, you can easily leverage our service from different context: at the time being you can use Oraclize from Ethereum, Eris, Roostock, Bitcoin and from any non-blockchain application. Working with both public and private blockchains, Oraclize is a service you can use without limitations on pretty much any context you have in mind.
