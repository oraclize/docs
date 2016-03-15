# Pricing

The use of Oraclize APIs requires the payment of a small fee, other than the reimbursement of the full gasLimit we are setting in the transaction sent back to your contract.



## Free calls

In order to make the testing of our service a little bit easier (and cheaper) to you, **the first Oraclize query call coming from any Ethereum address is completely free of charge**. This means we are even covering the callback transaction gas costs for you (up to the default gasLimit of 200k gas).

This might be helpful, for example, to send the first call to Oraclize directly from your contract constructor without having to create your contract with an attached amount of Wei. This means, again, that you can have a free triggering transaction for any date in the future (up to 60 days).

>Note: all the Oraclize calls are free while using Oraclize on testnets! This is for a moderate use in test environments only.


## Call fees

Our pricing model is simple, you are automatically paying (when calling oraclize_query):

* a price in $ (automatically converted in Ether at the current rate while calling oraclize_query) depending on the datasource used and the proof chosen (see table below)
* a refund of the full gasLimit we are setting in the callback transaction (the minimum and default value is 200k gas)


| Datasource| Price/call (w/o proof)| Price/call (w/ proof) |
| :------- | ----: | :---: |
| URL| 1¢  |  5¢     |
| Blockchain| 1¢    |  5¢    |
| Wolfram Alpha| 3¢     | _|
