# Security

Since Oraclize acts as a data carrier, the service could potentially tamper the result and provide some wrong data (different from the one provided by the chosen datasource). In order to avoid this dishonest behaviour, we optionally provide cryptographic proofs showing that this didn't happen.

These **honesty proofs**, as we call them, are generated via different methodologies (based on different forms of SW/HW attestation) which provide you strong authenticity guarantees.

Some of those proofs are based on external projects we leverage, while others were designed by us in-house in order to make our service more and more secure.

We are listing here the honesty proofs that Oraclize provides. Other than the original TLSNotary-based one, we have others in the workings which will be released in the coming weeks.


## TLSNotary proof

TLSNotary is a project implementing a modification of TLS. By using it you can prove that a certain server has really sent some data to you at a given point in time.

Pagesigner is a TLSNotary-based system which is designed to generate a distributable proof that anybody can use to indipendently verify the authenticity of a TLS response.

Oraclize provides the above proof, along with the result, so that you can be 100% sure that we are behaving honestly and that our response is really coming from a certain server at a specific time.


