# Pricing
The use of Oraclize requires the payment of a small fee, which depends from the data source type used and by the authenticity proof requested. The pricing listed below is valid for both Ethereum and Rootstock.

### First Free Request

To facilitate testing, the first call to Oraclize from any smart contract address, if used with standard setting, is free of charge. This includes the gas costs of the callback transaction.

### Testnets Policy
To keep compatibility with the main-net deployed, smart contracts testing Oraclize on any of the testnets are expected to pay the same fee they would on the main-net. Since the payment expected is in testnet Ether, which holds no value, the calls to Oraclize are de facto free.
Oraclize reserve the rights to discontinue the service for abuse or excessive use.

### Call Fee
The `oraclize_query` automatically recovers the fee at execution time. The fee consist of two parts:

* The amount of Wei which corresponds, using a recent exchange rate, to the USD price for the data source and the authenticity proof requested
* The amount of Wei which Oraclize will spend in gas for sending the callback transaction

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

### Offchain Payments
Oraclize will soon start testing offchain payments, in different currencies, for both the Oraclize fee and the gas callback transactions costs. Interested parties should get in touch at info@oraclize.it
