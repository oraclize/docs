# Overview

> ![](images/flowchart.png)

Oraclize aims to be the privileged carrier for data between blockchain protocols and the wider Internet. 

Our main goal as a company is to provide a way for smart contracts to break free of their constrains and provide them the ability to access all the data they need from the web, without compromising their trustless nature.

In particular, the aim is not to force smart contract developers in having to trust Oraclize with the data they need. Without any backing of authenticity, Oraclize could easily tamper with the data. This is why, in order to complete this complex task, Oraclize returns the data requested along with a proof of the authenticity: i.e that the data comes from the data provider which has been explicity demanded by the smart contract.

More can be read about the authenticity proofs provided by Oraclize, within the dedicated section of this documentation.



##  What is an oracle

The very definition of oracle defines what such entity does, but not who it is. Different actors are calling themselves oracle and this has lead users over time to a confused idea around the actual meaning of the term. For the sake of an easy but genuine understanding of what follows, we can define it as the party who provides to the blockchain some data that blockchain applications cannot access by themselves.

In general, the reason why the blockchain cannot reach out to external data is that it is inefficient and often impossible to find a decentralized consensus on a centralized data.


##  What is Oraclize

Oraclize is an elegant solution to the "oracle problem". We are the "state-of-the-art" oracle service and we enable any datasource (Web APIs, ..) to be used straight away from different blockchain applications.

This means that the datasources don't need to adapt or understand the blockchain and they can keep providing their data via the channels they already have (tipically their own Web APIs).

Ironically, Oraclize can be seen as a new intermediary in a new world built without intermediaries. While this could be seen as a weakness, it really doesn't. To understand more on how we ended up designing the system in this way and why this approach is so powerful, please read the next paragraph. 


##  Rationale

While our initial thoughts were reiterating over the concepts of a decentralized oracle system like Orisi, we soon figured out that the limits of that approach were not really acceptable. In order to stay agnostic to the data itself, it is important to keep the datasource and oracle parts separated. Sticking with that means that the blockchain integration is not something the datasource has to figure out on his side. Thanks to our approach, any datasource can be used out of the box in any context, while removing all the potential risks of putting an extra intermediary into the game. The authenticity proofs we provide can give strong guarantees around the authenticity of data. This means that while the data is sent to the blockchain by us, you can be 100% sure that it is coming, without modifications, from the datasource you have chosen.

##  Integrations

Thanks to our model, you can easily leverage our service from different context: at the time being you can use Oraclize from Ethereum, Eris, Roostock, Bitcoin and from any non-blockchain application. Working with both public and private blockchains, Oraclize is a service you can use without limitations on pretty much any context you have in mind.
