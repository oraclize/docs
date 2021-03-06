# <a style="display:inline-block; min-width:20px">&tritime;</a> EOS

The following section is dedicated to the Provable integration with EOS. Before reading this section, you must be familiar with the key concepts of the EOS platform such as contracts, transactions, actions and CPU/NET/RAM. So if things get blurred the [EOSIO Development Portal](https://developers.eos.io/) is your best friend.

The EOS platform supports both C and C++ as programming languages for contracts, however the current Provable integration currently supports **C++ only**.

<aside class="notice">
Provable is currently integrated with the EOSIO Mainnet, the public "Jungle" Testnet and the public "Kylin" Testnet.
</aside>

<aside class="notice">
Provable provides two separate EOS API: one <b>compatible</b> with the <b>CDT 1.6.1</b> and one with the <b>CDT 1.4.0</b>.
</aside>

## Rationale

The interaction between Provable and an EOS contract is asynchronous. Any request for data is composed of two steps:

* Firstly, in the most common case, a transaction executing a given action of a contract is broadcast by a user. That action contains a special instruction which instructs Provable to execute an off-chain task (like the data fetching from a Web API or [potentially much more](#data-sources)).
* Secondly, according to the parameters of said request, Provable will fetch or compute a result, build, sign and broadcast the transaction carrying the result. In the default configuration, this transaction will execute a `callback` action which should be placed in the contract by its developer: for this reason, the transaction is referred to in the documentation as the Provable callback transaction.

As said in previous sections, one of the fundamental characteristics of Provable is the capability of returning data to a contract together with one or more proofs of authenticity backing the data. The generation of an authenticity proof is optional and it must be configured by the EOS contract developer when the request for data is initiated. Provable always recommends the use of authenticity proofs for production deployments.


## Quick Start

```bash
# Let's get the "eos_api.hpp" header file
$ git clone https://github.com/provable-things/eos-api.git provable
```

### Including the Provable API

Before starting, it is necessary to include the `eos_api.hpp` header file. This file contains all the helper functions which we will be using to use Provable. The header file can be downloaded from the [eos-api github repository](https://github.com/provable-things/eos-api).
It is highly recommended to always use the latest version.

```c++
#include "provable/eos_api.hpp"

class eosusdprice : public eosio::contract
{
  public:
      using contract::contract;

      eosusdprice(eosio::name receiver, eosio::name code, datastream<const char*> ds) : contract(receiver, code, ds) {}

      [[eosio::action]]
      void execquery()
      {
          print("Sending query to Provable...");
          oraclize_query("URL", "json(https://min-api.cryptocompare.com/data/price?fsym=EOS&tsyms=USD).USD",\
           (proofType_Android | proofStorage_IPFS));
      }

      [[eosio::action]]
      void callback(
          const eosio::checksum256 queryId,
          const std::vector<uint8_t> result,
          const std::vector<uint8_t> proof
      )
      {
          require_auth(provable_cbAddress());
          const std::string result_str = vector_to_string(result);
          print(" Result: ", result_str);
          print(" Proof length: ", proof.size());
      }
};

EOSIO_DISPATCH(eosusdprice, (execquery)(callback))
```

The simplest way to introduce the EOS <-> Provable integration, is by showing a working example, such as the EOS contract on the right.
This contract uses Provable to fetch the last EOS/USD price from the API of CryptoCompare. The update process is initiated every time the action `execquery()` is called. The example shows two important components of using Provable:

* The contract should include the Provable header file
* the `oraclize_query` function and the `callback` action handle all the communication between our EOS contract and Provable

The code in the example is working out of the box on any EOS network where Provable is integrated.


### Simple Query

```c++
// This code example will ask Provable to send as soon as possible
// a transaction with the primary result (as a string) of the given
// formula ("random number between 0 and 100") fetched from the
// datasource "WolframAlpha".
oraclize_query("WolframAlpha", "random number between 0 and 100");

oraclize_query("URL", "https://api.kraken.com/0/public/Ticker?pair=ETHXBT")

oraclize_query("URL",
  "json(https://www.therocktrading.com/api/ticker/BTCEUR).result.0.last")

oraclize_query("IPFS", "QmdEJwJG1T9rzHvBD8i69HHuJaRgXRKEQCP7Bh1BVttZbU")
```

A request for data is referred to as a **query**. The `oraclize_query` is a function, implemented in the `oraclize/eos_api.hpp` header file, which expects at least two arguments:

* A datasource such as `URL`, `WolframAlpha`, `IPFS`, 'Swarm' and others listed here
* The argument for the given datasource. For example:
 * the full `URL`, which may include the use of JSON or XML parsing helpers as can be seen in the previous example
 * or a `WolframAlpha` formula
 * or an `IPFS` multihash

The number and type of supported arguments is dependent on the datasource being used. Additionally code examples will be provided to showcase this. The datasource, as well as the authenticity proof chosen, determine the fee which the contract has to pay to Provable.

### Schedule a Query in the Future

```c++
// Relative time: get the result from the given URL 60 seconds from now
oraclize_query(60, "URL",
  "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0")

// Absolute time: get the result from the given datasource at the specified UTC timestamp in the future
oraclize_query(scheduled_arrivaltime+3*3600,
  "WolframAlpha", strConcat("flight ", flight_number, " landed"));
```

The execution of a query can be scheduled for a future date. The function `oraclize_query` accepts, as a parameter the, delay in seconds from the current time (relative time) or the unix timestamp of the future date and time (absolute time).
Please note that in order for the future timestamp to be accepted by Provable it must be within **60 days** of the current UTC time in the case of the absolute timestamp choice, or in the case of relative time, the elapsed seconds must equate to no more than **60 days**.

```c++
#include "provable/eos_api.hpp"

class dieselprice : public eosio::contract
{
  public:
      using contract::contract;

      dieselprice(eosio::name receiver, eosio::name code, datastream<const char*> ds) : contract(receiver, code, ds) {}

      [[eosio::action]]
      void execquery()
      {
          print("Sending query to Provable...");
          oraclize_query(60, "URL", "xml(https://www.fueleconomy.gov/ws/rest/fuelprices).fuelPrices.diesel");
      }

      [[eosio::action]]
      void callback(
          const eosio::checksum256 queryId,
          const std::vector<uint8_t> result,
          const std::vector<uint8_t> proof
      )
      {
          require_auth(provable_cbAddress());
          const std::string result_str = vector_to_string(result);
          print("Diesel Price USD: ", result_str);
      }
};

EOSIO_DISPATCH(dieselprice, (execquery)(callback))
```

### Recursive Queries

```c++
#include "provable/eos_api.hpp"

class wolframrand : public eosio::contract
{
  public:
    using contract::contract;

    wolframrand(name receiver, name code, datastream<const char*> ds) : contract(receiver, code, ds) {}

    [[eosio::action]]
    void getrandomnum()
    {
        oraclize_query(10, "WolframAlpha", "random number between 1 and 6");
        print(" Provable query was sent, standing by for the answer...");
    }

    [[eosio::action]]
    void callback(
        const eosio::checksum256 queryId,
        const std::vector<uint8_t> result,
        const std::vector<uint8_t> proof
    )
    {
        require_auth(provable_cbAddress());
        const std::string result_str = vector_to_string(result);
        print("Result: ", result_str);
        if (result_str != "6")
          getrandomnum();
    }
};

EOSIO_DISPATCH(wolframrand, (getrandomnum)(callback))
```

EOS contracts using Provable can be effectively autonomous by implementing a recurring query to Provable into their `callback` action.
This can be useful for implementing periodic updates of some on-chain reference data, as with price feeds, or to periodically check for some off-chain conditions.

This modified version of the previous example will get a random number from the WolframAlpha API instead of the EOS/USD price and it will keep retrying every 10 seconds, until the contract has received back the result "6".

<aside class="notice">
Use recursive queries cautiously. In general it is recommended to send queries purposefully.
</aside>

### Checking the Query ID

```c++
#define CONTRACT_NAME "checkqueryid"

#include "provable/eos_api.hpp"

class checkqueryid : public eosio::contract
{
  public:
    using contract::contract;

    checkqueryid(eosio::name receiver, eosio::name code, datastream<const char*> ds) : contract(receiver, code, ds) {}

    [[eosio::action]]
    void checkquery()
    {
        eosio::checksum256 myQueryId = oraclize_query("URL", "json(https://api.kraken.com/0/public/Ticker?pair=EOSUSD).result.EOSUSD.l.0");
        oraclize_queryId_localEmplace(myQueryId);
        print(" Provable query was sent & queryId saved in the queryId table as a record, standing by for the answer...");
    }

    [[eosio::action]]
    void callback(
        const eosio::checksum256 queryId,
        const std::vector<unsigned char> result,
        const std::vector<unsigned char> proof
    )
    {
        require_auth(provable_cbAddress());
        if (!oraclize_queryId_match(queryId))
        {
            // The query Id match has failed, manage this use case...
            print(" Unexpected query ID!");
        }
        else
        {
            const std::string result_str = vector_to_string(result);
            print(" Result: ", result_str);
        }
    }
};

EOSIO_DISPATCH(checkqueryid, (checkquery)(callback))
```
Every time the function `oraclize_query` is called, it returns a unique ID, hereby referred to as `queryId`, which is guaranteed to be unique in the given network execution context.
The `queryId` identifies a specific query done to Provable and it is returned to the contract as a parameter of the callback action.

Provable recommends EOS contract developers to verify if the queryId sent by the callback action was generated by a valid call to the `oraclize_query` function, as shown in the example accompanying this paragraph. This ensures that each query response is processed only once and helps avoid misuse of the EOS contract logic.

#### Query ID Verification Process

It is a best practice to verify the query ID with the methods provided inside our `eos_api.hpp`:

1. First of all, the macro `CONTRACT_NAME` has to be defined, where its value will be the name of the contract to deploy.

2. The function `oraclize_queryId_localEmplace(myQueryId)` has to be called, passing as the argument the query ID returned by `oraclize_query()`. This function will save the query ID in the `queryId` table as a record. The table will be defined just by importing the API and defining the above macro.

2. The function `oraclize_queryId_match(queryId)` will perform the match between the `queryId` received by the callback and the query ID available in the `queryId` table.

To clarify, the `checkqueryid` example reproduces all these steps.

The `queryId` can be used as well to implement different behaviors into the `callback` function, in particular when there is more than one pending call from Provable.

### Resource allocations

The `callback` action is called by an Provable-controlled account, which will be in charge of allocating the resources for the action execution.
The following restrictions apply:

* no RAM will be usable by the calling account, so the EOS contract developer should take care, when operations needing RAM are to be executed in the context of the `callback` function, to define an appropriate payer (i.e.: the contract itself, `_self`)
* the max CPU usage is `100 ms`
* the max NET usage is `100 kb`

When additional resources are needed the EOS developer could either [reach out to Provable](mailto:info@oraclize.it) in order to discuss different arrangements or they could use EOS features to postpone the execution of a resource demanding task with a different payer.

<aside class="notice">
The above mentioned limits are experimental and could change before the launch on the EOS mainnet. In case of abuses some accounts may be temporarily banned from the Provable service.
</aside>


### Authenticity Proofs

```c++
#include "oraclize/eos_api.hpp"

class eosusdprice : public eosio::contract
{
  public:
      using contract::contract;

      eosusdprice(eosio::name receiver, eosio::name code, datastream<const char*> ds) : contract(receiver, code, ds) {}

      [[eosio::action]]
      void execquery()
      {
          print("Sending query to Provable...");
          oraclize_query("URL", "json(https://min-api.cryptocompare.com/data/price?fsym=EOS&tsyms=USD).USD",\
           (proofType_Android | proofStorage_IPFS));
      }

      [[eosio::action]]
      void callback(
          const eosio::checksum256 queryId,
          const std::vector<uint8_t> result,
          const std::vector<uint8_t> proof
      )
      {
          require_auth(provable_cbAddress());
          const std::string result_str = vector_to_string(result);
          print(" Result: ", result_str);
          print(" Proof length: ", proof.size());
      }
};

EOSIO_DISPATCH(eosusdprice, (execquery)(callback))
```

Authenticity proofs are at the core of Provable's oracle model. EOS contracts can request authenticity proofs together with their data by specifying the proof they want in the last argument of the `oraclize_query` function. The authenticity proof can be either delivered directly to the EOS contract or it can be uploaded and stored on <a href="http://ipfs.io/" target="_blank">IPFS</a>.

When an EOS contract requests an authenticity proof, it will receive the proof back when the `callback` action is called, in the form of the `std::vector<uint8_t> proof` argument.

The `proof` argument of `oraclize_query` is designed to be used as follows: `oraclize_query(..., (proofType_ | proofStorage_))`

Both proofType and proofStorage are byte constants defined in the `oraclize/eos_api.hpp` header file.

Available parameters for proofTypes are:

* `proofType_NONE`: the default value of any smart contract
* `proofType_TLSNotary`: available only on the *EOS Mainnet*
* `proofType_Android`
* `proofType_Native`
* `proofType_Ledger`: available only with the *random datasource*

While for proofStorage:

* `proofStorage_IPFS`

For example, `oraclize_query(..., (proofType_TLSNotary)` will return the full TLSNotary Proof bytes as the proof argument in the callback action. If instead `oraclize_query(..., (proofType_TLSNotary | proofStorage_IPFS)` is used, then Provable will return only the base58-encoded IPFS multihash as the proof argument.
It is highly recommended to use authenticity proofs at all times, but they can potentially be disabled by setting the `proof` argument to `proofType_NONE` or by simply omitting it.


### Verifiability

Supported proofs can be verified. The following tools can be used: <a href="#development-tools-network-monitor">Verification Tools</a>


## Advanced Topics

### Inspecting contract queries/cbs



```bash
$ cleos get actions oraclizeex1a -1 -4
#  seq  when                              contract::action => receiver      trx id...   args
================================================================================================================
?  683   2018-08-10T11:35:57.500       oraclizeconn::query => oraclizeconn  37b8aefe... {"sender":"oraclizeex1a","sversion":1,"timestamp":0,"queryId...
?  684   2018-08-10T11:36:07.500    oraclizeex1a::callback => oraclizeex1a  eedc89c4... {"queryId":"04c11c096b0ff2943e3b7a21e0937b58869286dde7d263f3...
?  685   2018-08-10T11:36:07.500       oraclizeconn::query => oraclizeconn  eedc89c4... {"sender":"oraclizeex1a","sversion":1,"timestamp":0,"queryId...
?  686   2018-08-10T11:36:14.500    oraclizeex1a::callback => oraclizeex1a  85cea38a... {"queryId":"ee512394267cbb9d68b4db24e90901feb0217b592fb20b7a...
```


```bash
$ cleos get actions oraclizeex1a -1 -4 --console
#  seq  when                              contract::action => receiver      trx id...   args
================================================================================================================
?  695   2018-08-10T11:48:00.000       oraclizeconn::query => oraclizeconn  ed95b01a... {"sender":"oraclizeex1a","sversion":1,"timestamp":10,"queryI...
>> {"v":[1,1],"t":10,"o":"oraclizeex1a","d":"WolframAlpha","q":"random number between 1 and 6","p":0,"i":"81c347bf65790948c3edcac63e07139f62928d9674e661a8633e8f4464ebfd72"}
?  696   2018-08-10T11:48:00.500    oraclizeex1a::callback => oraclizeex1a  00b77475... {"queryId":"2ae5f6edb1b3656c25beb61d0a7ca148c339898e67ac3a6d...
>> Result:2Provable query was sent, standing by for the answer..
?  697   2018-08-10T11:48:00.500       oraclizeconn::query => oraclizeconn  00b77475... {"sender":"oraclizeex1a","sversion":1,"timestamp":10,"queryI...
>> {"v":[1,1],"t":10,"o":"oraclizeex1a","d":"WolframAlpha","q":"random number between 1 and 6","p":0,"i":"ac77896e9560f36d96823ff14efce24e0a443110a8d518f1424f955e6e35a6ee"}
?  698   2018-08-10T11:48:06.500    oraclizeex1a::callback => oraclizeex1a  bfdbf675... {"queryId":"ac77896e9560f36d96823ff14efce24e0a443110a8d518f1...
>> Result:6
```
It is possible to monitor the interaction between a given EOS contract and Provable by using `cleos get actions`. This will show a high-level view of the actions between the calling contract and the Provable `connector` contract.
In case you wanted to see more details, it is enough to use the `--console` option (or `-j`): this will include any `console` output you may have generated from your `query` and `callback` action.

The [test_query page](http://app.oraclize.it/home/test_query) is another useful tool to monitor the processing of Provable queries (using the `queryId` returned by `oraclize_query` as an input).



### Delegating the resource allocation

When using the `oraclize_query` function, an EOS action to the Provable `connector` contract is started. By default the permission for this action is given by the EOS contract account itself. This could be changed, for example, to have the user of the contract paying for the action resources and for the Provable service fees (if any): it is enough to define a macro `ORACLIZE_PAYER` **before** including the `oraclize/eos_api.hpp` header file.

```c++
#define ORACLIZE_PAYER N(mypayinguser)

#include "oraclize/eos_api.hpp"

using namespace eosio;
...
```

### Computation Data Source

#### Passing Arguments to the Package

```c++
#include "oraclize/eos_api.hpp"

class urlrequests : public eosio::contract
{
  private:
    void request(
        const std::string _query,
        const std::string _method,
        const std::string _url,
        const std::string _kwargs
    )
    {
        std::vector<std::vector<unsigned char>> args = {
            string_to_vector(_query),
            string_to_vector(_method),
            string_to_vector(_url),
            string_to_vector(_kwargs)
        };
        std::vector<unsigned char> myquery = provable_set_computation_args(args);
        oraclize_query("computation", myquery);
    }

  public:
    using contract::contract;

    urlrequests(eosio::name receiver, eosio::name code, datastream<const char*> ds) : contract(receiver, code, ds) {}

    [[eosio::action]]
    void reqheadscust()
    {
        print("Sending query to Provable...");
        request("json(QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE).headers",
                "GET",
                "http://httpbin.org/headers",
                "{'headers': {'content-type': 'json'}}"
               );
    }

    [[eosio::action]]
    void reqbasauth()
    {
        request("QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE",
                "GET",
                "http://httpbin.org/basic-auth/myuser/secretpass",
                "{'auth': ('myuser','secretpass'), 'headers': {'content-type': 'json'}}"
               );
    }

    [[eosio::action]]
    void reqpost()
    {
        request("QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE",
                "POST",
                "https://api.postcodes.io/postcodes",
                "{\"json\": {\"postcodes\" : [\"OX49 5NU\"]}}"
               );
    }

    [[eosio::action]]
    void reqput()
    {
        request("QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE",
                "PUT",
                "http://httpbin.org/anything",
                "{'json' : {'testing':'it works'}}"
               );
    }

    [[eosio::action]]
    void reqcookies()
    {
        request("QmdKK319Veha83h6AYgQqhx9YRsJ9MJE7y33oCXyZ4MqHE",
                "GET",
                "http://httpbin.org/cookies",
                "{'cookies' : {'thiscookie':'should be saved and visible :)'}}"
               );
    }

    [[eosio::action]]
    void callback(
        const eosio::checksum256 queryId,
        const std::vector<unsigned char> result,
        const std::vector<unsigned char> proof
    )
    {
        require_auth(provable_cbAddress());
        const std::string result_str = vector_to_string(result);
        print("Response: ", result_str);
    }
};

EOSIO_DISPATCH(urlrequests, (reqheadscust)(reqbasauth)(reqpost)(reqput)(reqcookies)(callback))
```

Arguments can be passed to the package by adding parameters to the query array. They will be accessible from within the Docker instance as environmental parameters.

Currently the API supports up to 5 inline arguments, including the IPFS Hash:

`
std::vector<std::vector<unsigned char>> myquery = {
      string_to_vector("QmZRjkL4U72XFXTY8MVcchpZciHAwnTem51AApSj6Z2byR"),
      string_to_vector("_firstOperand"),
      string_to_vector("_secondOperand"),
      string_to_vector("_thirdOperand"),
      string_to_vector("_fourthOperand")
    };
`

`oraclize_query("computation", myquery);`

#### Passing more than 5 Arguments

In case you need to pass more arguments, you will need to send a manually set dynamic string/bytes array, for example:

`std::string myArgs[6] = { "MYIPFSHASH", ... };`

The query would then look like this: `oraclize_query("computation", myArgs);`

### Random Data Source

Included with the Provable `eos_api.hpp`, which EOS contracts should use to interface with Provable,
some specific functions related to the Provable Random Data Source have been added. In particular:

* `oraclize_newRandomDSQuery`: helper to perform an Provable random DS query correctly
* `oraclize_randomDS_proofVerify`: performs the verification of the proof returned with the callback transaction

#### Specify The Network Context

It is **highly recommended** for the developer to define the _network context_ and the _contract name_ in which the smart contract will operate.

For the network context:

* For the EOS testnet Jungle: `#define ORACLIZE_NETWORK_NAME "eosio_testnet_jungle"`
* For the EOS mainnet `#define ORACLIZE_NETWORK_NAME "eosio_mainnet"`

For the contract name:

* `#define CONTRACT_NAME "contractname"`

```c++
#define ORACLIZE_NETWORK_NAME "eosio_testnet_jungle"
#define CONTRACT_NAME "randomsample"

#include "oraclize/eos_api.hpp"

class randomsample : public eosio::contract
{
  public:
    using contract::contract;

    randomsample(eosio::name receiver, eosio::name code, datastream<const char*> ds) : contract(receiver, code, ds) {}

    [[eosio::action]]
    void getrandnum()
    {
        print("Sending query to Provable...");
        uint8_t N = 1; // Possible outputs: [0-255]
        uint32_t delay = 10;
        oraclize_newRandomDSQuery(delay, N);
    }

    [[eosio::action]]
    void callback(
        const eosio::checksum256 queryId,
        const std::vector<unsigned char> result,
        const std::vector<unsigned char> proof
    )
    {
        require_auth(provable_cbAddress());
        if (oraclize_randomDS_proofVerify(queryId, result, proof, _self) != 0)
        {
            // The proof verification has failed, manage this use case...
            print(" Proof failed has failed...");
        }
        else
        {
            print("Number: ", result[0]);
        }
    }
};

EOSIO_DISPATCH(randomsample, (getrandnum)(callback))
```

## More Examples

More documented, complete and complex examples are available on the dedicated Github repository: <a href="https://github.com/oraclize/eos-examples" target="_blank">https://github.com/oraclize/eos-examples</a>

## Pricing

The Provable integration with EOS is currently available on the EOSIO Mainnet and on the **[EOSIO Public "Jungle" Testnet](http://jungle.cryptolions.io/)**;

Provable is currently charging **no fee**.

Our standard [pricing table](#pricing) may eventually apply (equivalent USD value in `EOS` tokens
charged), later on the EOSIO Mainnet. If this occurs, the same pricing logic would take place on the
testnet to simulate the functionality. This will be charged in testnet EOS, and so is free.
Contracts that have been deployed during the no-fee period will be considered legacy, and we will
continue to provide our service as it was to them, however, their featureset will stay within the
legacy spectrum as well (i.e. new features dependent on the pricing model are obviously not going to
be transferrable to these).
