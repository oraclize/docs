# Pricing

The use of Oraclize APIs requires the payment of a small fee. This fee comes on top of the reimbursement for the full `gasLimit` we are setting in the transaction when we call back your contract.


## Free calls

In order to make the testing of our service a little bit easier (and cheaper) to you, **the first Oraclize query call coming from any Ethereum address is completely free of charge**. This means we are even covering the callback transaction gas costs for you (up to the default `gasLimit` of 200k gas).

This might be helpful, for example, to send the first call to Oraclize directly from your contract constructor function without having to create your contract with an attached amount of Wei. This means, again, that you can have one free triggering transaction for any date in the future (up to 60 days).

>Note: Oraclize calls are free when used on testnets! This works for moderate usage in test environments only.


## Call fees

Payment is part and parcel of the `oraclize_query` function call, and our pricing model is simple:

* a price in $ depending on the datasource used and the proof chosen (see table below). This $ price is automatically converted to Ether at the current rate when you call `oraclize_query`
* a refund of the full `gasLimit` we are setting in the callback transaction (the minimum and default value is 200k gas)


| Datasource| Price/call (w/o proof)| Price/call (w/ proof) |
| :------- | :----: | :---: |
| URL| 1¢  |  5¢     |
| Blockchain| 1¢    |  5¢    |
| Wolfram Alpha| 3¢     | _|
