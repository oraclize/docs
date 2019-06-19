# <a style="display:inline-block; min-width:20px">&num;</a> Fabric

The following section is dedicated to the Provable integration with Hyperledger Fabric.

The Hyperledger Fabric platform supports Go, Node and Java as main programming languages for chaincodes; however, the current Provable integration (while it internally uses a Node chaincode) is provided in the form of an API which is made accessible via a Go package - this means that you will be able to use Provable from your **Go** chaincode with ease, but in the future Node/Java could be easily supported as well.

To better profit from this section of the documentation, previous knowledge of Go, Node, Docker and Hyperledger Fabric is required.

As said in previous sections, one of the fundamental characteristics of Provable is the capability of returning data to a contract, a chaincode in the Fabric space, together with one or more proofs of authenticity backing the data. The generation of an authenticity proof is optional and it must be configured by the chaincode developer when the request for data is initiated. Provable always recommends the use of authenticity proofs for production deployments.

## Quick Start

The simplest way to introduce the Provable integration with Hyperledger Fabric, it is by showing a working example.

This example uses Provable to fetch the last EUR/USD exchange rate from cryptocompare.com APIs. The update process is initiated every time the query is sent. The example shows two important components needed when using Provable, both of which can be fetched from the [dedicated fabric-api Provable repository on Github](https://github.com/oraclize/fabric-api):

* The Provable connector chaincode [connector/oraclize-connector.js](https://github.com/oraclize/fabric-api/blob/master/connector/oraclize-connector.js), which should be installed on the network peer;
* The Go package - [oraclizeapi.go](https://github.com/oraclize/fabric-api/blob/master/oraclizeapi.go) - needed to use the Provable API from within a user-defined Go chaincode.

<aside class="notice">
Provable can currently be used free of charge in any Hyperledger Fabric networks. This will change in the near future and the standard pricing will apply: for more details please check out the pricing section of the documentation. The payment will be taken outside of the Fabric network with a dedicated user account holding some prepaid credit.
</aside>

### Prerequisites

The Provable integration described in the document assumes the user to be familiar with at least one of the first tutorials provided by the Hyperledger Fabric documentation. The tutorial can be found at the following link: [Writing Your First Application](https://hyperledger-fabric.readthedocs.io/en/release-1.2/write_first_app.html).

### Architecture Overview

In order to make the user approach the Hyperledger Fabric blockchain, several samples are provided through the official Hyperledger source. The folder containing these samples includes some basic network configurations really useful to have a clear and simple Provable integration. The folder `fabric-samples`, which includes the samples, can be downloaded executing the following command:

`curl -sSL http://bit.ly/2ysbOFE | bash -s 1.2.0`

That command downloads the `fabric-samples` folder; specifically the folder `fabric-samples/basic-network` is the **network** that we are going to use to showcase the Provable integration. The basic-network creates a network structure composed by the following entities:

* one application (cli);
* one peer;
* one orderer;
* one CA

On the peer two chaincodes will be installed:

* the `oraclize-connector`, the chaincode provided by Provable, that is used internally by Provable to execute any query;
* the `user-chaincode`, the chaincode that the user wants to create in order to build a service in the Hyperledger Fabric blockchain.

The *legend* concerning the living entities in this example of a Fabric network is shown in the following image:

<img src="images/fabric-entities.png" width="65%" height="65%">

The **network structure** is displayed in architectural schema below:

<img src="images/basic-network.png" width="52%" height="52%">


### Transaction Flow

In this section we will analyze the transaction flow of a query performed in the `basic-network` example integrating Provable.
The 3 first steps of the transaction flow are displayed by the following figure:

<img src="images/transaction-flow.png" width="55%" height="55%">

The flow can be divided in the process phases below:

1. from the application A, the user starts a query directed to the peer P1, calling a function of the Go user chaincode S1, that calls an Provable query.
2. the user chaincode S1, executes the function invoked by the user, and send the data for the Provable query to the Provable connector, the chaincode S2;
3. the Provable chaincode S2, once the result is ready, sends it back to the user chaincode S1, along with the authenticity proof;
4. the user chaincode S1 does something with the result (and authenticity proof) received back from Provable and eventually sends back a response to the application A.

### Network Building

This subsection goal is to build up the network described in the figure previously showed. First, access the `fabric-samples` folder and create a project folder for our Provable integration example. In this documentation, the name referring to it is `fabric-samples/oraclize-integration`.
This folder is the container for all the operations which happens from the application-cli side.
Inside the `oraclize-integration` folder, we will have the following files:

* `enrollAdmin.js`
* `registerUser.js`
* `startFabric.sh`
* `user-application-query.js`

Both files `enrollAdmin.js` and `registerUser.js` can be copied from the folder `fabric-samples/fabcar`.
The following commands can be launched from the folder `fabric-samples`:

* `cp fabcar/enrollAdmin.js oraclize-integration`
* `cp fabcar/registerUser.js oraclize-integration`

Then, in the `oraclize-integration` folder, install the packages below:

* `npm install fabric-client`
* `npm install fabric-ca-client`

```bash
#!/bin/bash

# Do not rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
LANGUAGE=${1:-"golang"}
# CC_SRC_PATH refers to the docker cli container
CC_SRC_PATH=github.com/user-chaincode/go
if [ "$LANGUAGE" = "node" -o "$LANGUAGE" = "NODE" ]; then
    CC_SRC_PATH=/opt/gopath/src/github.com/oraclize-connector/node
fi

# Clean the keystore
rm -rf ./hfc-key-store
# Remove all the previously generated containers, representing entities and chaincodes
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi dev-peer0.org1.example.com-oraclize-connector-1.0-7765c3fb5c4224a4a2784d8a64a5488e570d39940695306f78f8e54009d89102
docker rmi dev-peer0.org1.example.com-user-chaincode-1.0-58b4cc4747da6f30d7cb2cea6511560c9fdad78c58ba6881b33801a2d69aebae

# Exit on first error
set -e
# Go in the fabric-samples/basic-network folder to launch the network;
cd ../basic-network
./start.sh

# Now launch the CLI container in order to install, instantiate chaincodes
docker-compose -f ./docker-compose.yml up -d cli

# Instantiating the user chaincode (user-chaincode)
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n user-chaincode -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"
# Installing the user chaincode (user-chaincode)
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n user-chaincode -l "golang" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"

# Instantiating the Provable chaincode (oraclize-connector)
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n oraclize-connector -v 1.0 -p "/opt/gopath/src/github.com/oraclize-connector/node" -l "node"
# Installing the Provable chaincode (oraclize-connector)
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n oraclize-connector -l "node" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"

# Go back to the user application folder and install all the node_modules
cd ../oraclize-integration
npm install

# Enroll the admin
node enrollAdmin.js
# Register the user
node registerUser.js
```

Download the file called `fabric-examples/eurusd-example/testing-utils/startFabric.sh` from the [fabric-examples Provable repository on Github](https://github.com/oraclize/fabric-examples). This script is shown in full in the code section on the right and it is the script used to execute the following operations in order:

1. set the environment variables;
2. clean the certificates and the keystore, deleting the `hfc-key-store` folder;
3. stop and remove all the previous docker containers which represent the network entities;
4. remove the chaincode containers;
5. launch the network `fabric-samples/basic-network`, creating a docker container for:
    * the orderer;
    * the CA;
    * the peer;
    * the cli;
    * the couchdb;
6. launch the *cli* to install and instantiate the `oraclize-connector` and the `user-chaincode` chaincodes, launching them as containers;
7. install the node modules;
8. enroll the admin calling `enrollAdmin.js`;
9. register the user, calling `registerUser.js`.

<aside class="notice">
Please note that Go must be installed, and that the Go environment variables must be correctly set.
</aside>

### Adding the Provable Chaincode

```json
{
	"name": "oraclize-connector",
	"version": "1.0.0",
	"description": "oraclize-connector chaincode implemented in node.js",
	"engines": {
		"node": ">=8.4.0",
		"npm": ">=5.3.0"
	},
	"scripts": {
		"start": "node oraclize-connector.js"
	},
	"engine-strict": true,
	"license": "Apache-2.0",
	"dependencies": {
		"cbor-sync": "^1.0.2",
		"fabric-shim": "unstable",
		"node-pre-gyp": "^0.10.3",
		"request": "^2.87.0"
	}
}
```

In the `startFabric.sh` script, the last two docker commands refer to the instance and install the Provable connector chaincode. This chaincode, referred in the documentation with the name of `oraclize-connector`, is instantiated on the network peer from the cli docker container.

The cli container instantiate and install the oraclize chaincode from its local chaincodes set. However, the cli takes this chaincode set from the folder `fabric-samples/chaincode`; as a result, the *node.js* `oraclize-connector` and the *Go* `user-chaincode` have to be in the mentioned path.

The `oraclize-connector.js` chaincode is provided by Provable at [fabric-api/connector Provable repository on Github](https://github.com/oraclize/fabric-api/) and has to be put in the following path `fabric-samples/chaincode/oraclize-connector/node`, so that the final result will be: `fabric-samples/chaincode/oraclize-connector/node/oraclize-connector.js`.

For correctly set the `oraclize-connector` chaincode, the files `oraclize-connector.js` and the `package.json` are needed. The `package.json` is required to install the specified dependencies, while the `oraclize-connector.js` is the node Provable chaincode itself.

<aside class="notice">
Please, note that the paths and names mentioned have not be changed for a correct integration.
</aside>

### Adding the User Chaincode

```javascript
func (s *SmartContract) fetchEURUSDviaOraclize(APIstub shim.ChaincodeStubInterface) sc.Response {
    var datasource = "URL"
    var query = "json(https://min-api.cryptocompare.com/data/price?fsym=EUR&tsyms=USD).USD"
    result, proof := oraclizeapi.ProvableQuery_sync(APIstub, datasource, query, oraclizeapi.TLSNOTARY)
    return shim.Success(result)
}
```

Create a folder that will contain your chaincode in`fabric-samples/chaincode`, in this example `fabric-samples/chaincode/user-chaincode/go`. Create the Go chaincode, in this example the referred name is `user-chaincode.go`. Now, the Provable Go package has to be included, in order to perform an Provable query.
On the [fabric-examples/eurusd-example/chaincode/go/ Provable repository on Github](https://github.com/oraclize/fabric-examples) we provide a ready-to-use user chaincode. Inside the chaincode, all the dependencies needed are included, including the `oraclizeapi.go`.
However, you need to install the dependencies locally, using the command:

`go get "github.com/oraclize/fabric-api"`

Please note that all the go packages, including the `oraclizeapi.go`, must be vendored in your chaincode folder `fabric-samples/chaincode/user-chaincode/go`. In general, vendoring the package with [govendor](https://github.com/kardianos/govendor) can be a good solution to include a package in the user chaincode. The package must appear in the `vendor` folder at the following path: `fabric-samples/chaincode/user-chaincode/go/vendor`.

The package allows to perform a request for data using an Provable query function, with the following code:
`oraclizeapi.OraclizeQuery_sync(APIstub, dataset, url, proofType)`

The code of a function performing a call for the EUR/USD exchange rate data using an Provable query in the user chaincode is shown on the right. The proof required by the chaincode in the example is the TLSNOTARY proof.

### Provable Simple Query

A request for data is called **query**. The `OraclizeQuery_sync` is a function, implemented in the `oraclizeapi.go` Go package, which expects three arguments:

* A data-source such as `URL`, `WolframAlpha`, `IPFS`, `Swarm` and others listed here
* The argument for the given data-source; for examples:

  * the full `URL`, which may include the use of JSON or XML parsing helpers as it can be seen in the previous example
  * or a `WolframAlpha` formula
  * or an `IPFS` multihash

* The proof type, that can be specified using the following values, imported from `oraclizeapi.go`:

  * NONE
  * TLSNOTARY
  * ANDROID
  * LEDGER
  * NATIVE

The number and type of supported arguments depends on the data-source in use.

### Sending CLI Queries

```javascript
const request = { chaincodeId: "user-chaincode", fcn: "fetchEURUSDviaOraclize", args: [] }
```

In order to test the example function `fetchEURUSDviaOraclize` which calls the Provable query from the `user-chaincode`, you need to start the network first.
After launching the Docker daemon, you proceed by running the following command from the folder `fabric-samples/oraclize-integration`:

`./startFabric.sh`

Then, when the network is fully up, with all its 7 containers (4 entities, 2 chaincodes, 1 couchdb),
run the application query file `user-application-query.js`, with the command:

`node user-application-query.js`

The EUR/USD exchange rate result is returned with the authenticity proof specified chaincode side.

<aside class="notice">
For the full code the example file above please refer to the
    <a href="https://github.com/oraclize/fabric-examples">fabric-examples Provable repository on Github</a>
.
</aside>
