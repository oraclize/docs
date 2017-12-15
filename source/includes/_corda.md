# C&#8226; &nbsp; Corda

Here we will cover the Oraclize's Corda integration. Before reading this section, you must be familiar with the Corda platform key concepts like flows, subflows, contracts, transactions, commands, oracles etc. So if things get blurred the [corda documentation](https://docs.corda.net/) is your best friend.

## Quick Start

The Oraclize service quite resembles the Oracle model described in Corda, but instead of providing direct access to the `query()` and `sign()` methods, it implements a set of flows which can be called when requiring data from the outside world. Look at the following steps to see how this can be achieved.

### Query Oraclize

```java
val answer = subFlow(OraclizeQueryAwaitFlow(
                datasource = "URL",
                query = "json(https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=GBP).GBP",
                proofType = ProofType.TLSNOTARY
            ))

```

```java
val proofVerificationTool = OraclizeUtils.ProofVerificationTool()
proofVerificationTool.verifyProof(answer.proof as ByteArray)
```

The fastest way to query Oraclize is by using the `OraclizeQueryAwaitFlow` which accepts the arguments defined in the previous sections (see the [Oraclize Engine](#general-concepts-oraclize-engine) for additional details). 
As shown on the code on the right, the flow fetches the last USD/GBP rate from the APIs specified, requiring a proof of type *TLSNotary*. Notice that the `json(...)` parser will exctract exactly the result we are concern about.

<aside class="notice">
    As the communication between flows is blocking, the current flow will remains idle until Oraclize will dispose back the answer. 
</aside>


Once the answer is successfully returned, the proof can be easily verified by using the `ProofVerificationTool` defined in `OraclizeUtils`. 

<aside class="notice">
To safely check the authenticity of the data received it is customary to verify the proof included in an Oraclize's answer. Once the verifyProof
method succeed (returning 'true'), the user can be sure that nor Oraclize neither other Parties has tampered the results. This can be checked from each party involved in the transaction which has loaded our CordApp.

Note that the ProofVerificationTool is a module included in the Oraclize's CordApp and performs the verification locally within the node.
</aside>

```java
val oracle = serviceHub.identityService
                .wellKnownPartyFromX500Name(OraclizeUtils.getNodeName()) as Party
val answerCommand = Command(answer, oracle.owningKey)
```

If you want to put the results in a transaction, it is necessary to wrap the answer in a `Command` along with the Oraclize's node public key. Note that the Oraclize's node can be obtained by using the `serviceHub.identityService`, identifying the node with `OraclizeUtils.getNodeName()`. 

### Building the transaction

Now we have all the ingredients to build a transaction: check the code on the right to see how it is done.

```java
val tx = TransactionBuilder(someNotary).withItems(
                    StateAndContract(someState, SomeContract.TEST_CONTRACT_ID),
                    someCommand, answerCommand)

tx.verify(serviceHub)
```

Notice that:

  * `someNotary` is a notary node of your choice, for example `val someNotary = serviceHub.networkMapCache.notaryIdentities.first()` 
  * `someState` is an output state that usually live along with the oracle answer
  * `someContract` is a valid Corda contract listing all the assertion on the I/O states, by means of a `requireThat` closure (see below for more details about the contract)
  * `someCommand` is a command which specify the operation being perfomed by the transaction including the issuer public key

### Sign the transaction

```java
// Filter out non Oracles data
fun filtering(elem: Any): Boolean {
    return when (elem) {
        is Command<*> -> oracle.owningKey in elem.signers && elem.value is Answer
        else -> false
    }
}

val ftx = txBuilder.toWireTransaction(serviceHub).buildFilteredTransaction(Predicate { filtering(it) })

```

Before sending the transaction to Oraclize for signing, it is customary to filter out all the non-Oraclize data as shown by the the function `filtering` on the right. 

```java
val signedTx = serviceHub.signInitialTransaction(tx)
        .withAdditionalSignature(subFlow(OraclizeSignFlow(ftx)))
```

Then the signature can be requested by using `OraclizeSignFlow` which accepts the `FilteredTransaction` defined before as argument. The flow will check that the query has actually been submitted in the past and then will return a `TransactionSignature` containing the one from `Oraclize`.

## Details

### The Oraclize's Answer

```java
// In the contract
override fun verify(tx: LedgerTransaction) {
    ...
    val answerCommand = tx.commands.requireSingleCommand<Answer>()

    requireThat {
        ...

        // Check tha Oraclise's answer 
        val rate = answerCommand.value.rawValue as String
        "The rate USD/GBP must be over $USD_GBP_RATE_THRESH" using (rate.toDouble() > USD_GBP_RATE_THRESH)

        // You can use the proof verification tool in the contract as well
        val proofVerificationTool = OraclizeUtils.ProofVerificationTool()
        "Oraclize's proof verification failed" using  (
                proofVerificationTool.verifyProof(answerCommand.value.proof as ByteArray))
    }
}
```

The `Answer` model defined by Oraclize permits the access to the following information:

  * `queryId`: the query ID of the current answer
  * `rawValue`: the actual result (could be a ByteArray or a String)
  * `value`: the string representation of the result (an hex string if it is a ByteArray)
  * `proof`: the proof as a ByteArray
  * `type`: a string specifying the type of the `rawValue` field
     + `"str"` if it is a String
     + `"hex"` if it is a ByteArray


### The contract

As the answer is wrapped in a transaction by means of a command, you can easily access it inside a contract by using `tx.commands.requireSingleCommand<Answer>()` and check that the answer satisfies all the requirements.

On the right we verify that the value stored in the Answer is a constant above a certain threshold along with the verification of the proof requested.
If one of the above assertions fails the contract is rejected and the flow is stopped.

### RPC calls

```
>>> start OraclizeQueryAwaitFlow  datasource: Wolfram, query: random number between 0 and 100, proofType: 0, delay: 0
```

It is also possible to call the `OraclizeQueryAwaitFlow` by RPC using the CRash shell (`>>>`) as shown on the right.

### Example 

```
>>> start Example amount: 10
>>> run vaultQuery contractStateType: it.oraclize.cordapi.examples.states.CashOwningState
```

Inside the CordApp you can find a ready-to-use example which self Issue the specified amount of cash if the rate of USD/GBP is above a certain threshold. 
Check the [corda-api](https://github.com/oraclize/corda-api) repository for the full details of how it works.

Then feel free to check the transaction by query the vault as shown on the right.
  
### Adding the Cordapp to your project

```gradle
repositories {
    maven { url 'https://jitpack.io' }
}
dependencies {
    compile "com.github.oraclize:corda-api:linux_x86_64-SNAPSHOT"
}
```

If you want to use the Oraclize's CordApp in your project just put one of the  dependencies in your `build.gradle` file:

  * `compile "com.github.oraclize:corda-api:linux_x86_64-SNAPSHOT"`
  * `compile "com.github.oraclize:corda-api:win32_x86_64-SNAPSHOT"`
  * `compile "com.github.oraclize:corda-api:macosx_x86_64-SNAPSHOT"`

&nbsp;<br>

```
Exception: J2V8 native library not loaded
```
<aside class="notice">
To make the proof verification tool work correctly it is necessary that you put the right dependency corresponding to your node's architecture, otherwise the proof will fail raising an exception as the one displayed.
</aside>

