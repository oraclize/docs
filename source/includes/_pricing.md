# Pricing
The use of Provable requires the payment of a small fee, which depends from the data source type used and by the authenticity proof requested. The pricing listed below is valid for both Ethereum and Rootstock. There is a baseprice for the query itself. When the `oraclize_query` gets called the needed ETH has to be transfered to Provable to pay for sending the callback transaction back to the contract.

Since this cost depends on the code and preferences (gasprice), it can vary a lot depending on the two of them. To prevent unneccessary costs you should estimate and set the gasprice and the gas as precise as possible, so that you get reasonable confirmation times and so that your callback transaction works as expected (without running out of gas).


### First Free Request

To facilitate testing, the first call to Provable from any smart contract address, if used with standard setting, is free of charge. This includes the gas costs of the callback transaction.

### Testnets Policy
To keep compatibility with the main-net deployed, smart contracts testing Provable on any of the testnets are expected to pay the same fee they would on the main-net. Since the payment expected is in testnet Ether, which holds no value, the calls to Provable are de facto free.
Provable reserve the rights to discontinue the service for abuse or excessive use.

### Call Fee
The `oraclize_query` automatically recovers the fee at execution time. The fee consist of two parts:

* The amount of Wei which corresponds, using a recent exchange rate, to the USD price for the data source and the authenticity proof requested
* The amount of Wei which Provable will spend in gas for sending the callback transaction

<style type="text/css">
	tr, td, th {
		text-align: center !important;
		vertical-align: middle !important;
	}
</style>

<table>
  <tr>
    <th rowspan="2" style="vertical-align: bottom !important;">Datasource</th>
    <th rowspan="2" style="vertical-align: bottom !important;">Base price</th>
    <th colspan="4">Proof type</th>
  </tr>
  <tr>
    <td>None</td>
    <td>TLSNotary</td>
    <td>Android</td>
    <td>Ledger</td>
  </tr>
  <tr>
    <td>URL</td>
    <td style="background-color:#FFEFD0;font-weight: 700;">0.01$</td>
    <td>+0.0$</td>
    <td>+0.04$</td>
    <td>+0.04$</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td>WolframAlpha</td>
    <td style="background-color:#FFEFD0;font-weight: 700;">0.03$</td>
    <td>+0.0$</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td>IPFS</td>
    <td style="background-color:#FFEFD0;font-weight: 700;">0.01$</td>
    <td>+0.0$</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td>random</td>
    <td style="background-color:#FFEFD0;font-weight: 700;">0.05$</td>
    <td>+0.0$</td>
    <td>N/A</td>
    <td>N/A</td>
    <td>+0.0$</td>
  </tr>
  <tr>
    <td>computation</td>
    <td style="background-color:#FFEFD0;font-weight: 700;">0.50$</td>
    <td>+0.0$</td>
    <td>+0.04$</td>
    <td>+0.04$</td>
    <td>N/A</td>
  </tr>
</table>



### Onchain vs. Offchain Payments
When paying onchain there is no reliable backward-compatible way for Provable to give back the gas "change". This is due to how Ethereum works: it is not possible to determine the exact amount of gas that will be used before the transaction gets confirmed, because it depends on the current state. Sending back the unspent gas afterwards would potentially create side effects.


Provable is now supporting offchain payments too. When using that option you will get back the unused gas as the charge happens on a prepaid account outside of the blockchain. Interested parties should get in touch at info@oraclize.it


### Nested Queries
Currently nested queries are being priced as a single query. In the near future the pricing for the nested queries will be a sum of the datasources you decide to use. At the moment the pricing is reduced to one single datasource, however your smart contract should take into account that the full pricing will apply at some point.
