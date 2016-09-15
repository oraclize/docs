# Pricing

The use of Oraclize APIs requires the payment of a small fee, you can check out the pricing for each integration below:

 * <a href="#ethereum">Ethereum</a>


## Ethereum

The fee for Ethereum comes on top of the reimbursement for the full `gasLimit` we are setting in the transaction when we call back your contract.

### Free calls

In order to make the testing of our service a little bit easier (and cheaper) to you, **the first Oraclize query call coming from any Ethereum address is completely free of charge**. This means we are even covering the callback transaction gas costs for you (up to the default `gasLimit` of 200k gas).

This might be helpful, for example, to send the first call to Oraclize directly from your contract constructor function without having to create your contract with an attached amount of Wei. This means, again, that you can have one free triggering transaction for any date in the future (up to 60 days).

<aside class="notice">
Note: Oraclize calls are free when used on testnets! This works for moderate usage in test environments only.
</aside>

### Call fees

Payment is part and parcel of the `oraclize_query` function call, and our pricing model is simple. It's composed of two parts:

* a price in $ depending on the datasource used and the proof chosen (see table below). This $ price is automatically converted to Ether at the current rate when you call `oraclize_query`
* a refund of the full `gasLimit` we are setting in the callback transaction (the minimum and default value is 200k gas)

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
    <th colspan="2">Proof type</th>
  </tr>
  <tr>
    <td>None</td>
    <td>TLSNotary</td>
  </tr>
  <tr>
    <td>URL</td>
    <td style="background-color:#FFEFD0;font-weight: 700;">0.01$</td>
    <td>+0.0$</td>
    <td>+0.04$</td>
  </tr>
  <tr>
    <td>Blockchain</td>
    <td style="background-color:#FFEFD0;font-weight: 700;">0.01$</td>
    <td>+0.0$</td>
    <td>+0.04$</td>
  </tr>
  <tr>
    <td>WolframAlpha</td>
    <td style="background-color:#FFEFD0;font-weight: 700;">0.03$</td>
    <td>+0.0$</td>
    <td>N/A</td>
  </tr>
  <tr>
    <td>IPFS</td>
    <td style="background-color:#FFEFD0;font-weight: 700;">0.01$</td>
    <td>+0.0$</td>
    <td>N/A</td>
  </tr>
</table>