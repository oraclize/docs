# General Concepts

## If this than that

The Oraclize engine replicates internally the "If This Than That" logic. This means that a given set of instructions is given to it and in the case the conditions are met, something you have described will happen. A typical scneario is the recurrent verification of a certain data and it being returned just when a given threshold is reached. This is very generic and can be leveraged in different ways.

## Context abstraction

Oraclize wants to stay as generic as possible in regards of the context. This is why each Oraclize query have to specify a datasource and a query text. The datasource is the source of data you want the query to be asked to, the query text is a unique reference to the data you want which is written in a way the datasource can understand. 

## Data and computations

Thanks to the datasource being generic, it does not need to be a Web API necessarly. It can even be something completely different like an individual, a judge/jury or a piece of code. You can look at the list of the supported datasources in the dedicated section to know more about the datasource we currently support.

## Examples

Given the above, you can ask things like:

* datasource: `WolframAlpha`, query: `who is the president of the US?`
* datasource: `URL`, query: `https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD` 


## Parsing helpers

In order to facilitate the post-processing of data, some simple to use (and simple to audit!) parsing helpers are available. This means you can filter down the results coming from the datasource in a way that only the data you need is sent back to you. Note that the authenticity proof will still reference the full content.

## Authenticity proofs

While Oraclize acts as an intermediary, you don't need to trust it. You can easily verify the authenticity of the data provided thanks to the use of authenticity proofs. You can find more details on that in the "Security Deep-dive" section.

## Data privacy

In some context, like smart contract living on the blockchain, you might require some level of privacy to protect your data from public scrutiny. This is possible thanks to the use of encrypted queries. What in means is that you can encrypt with the Oraclize public key your queries, or part of them, so that the level of privacy your application has is fully dependant on your will.
