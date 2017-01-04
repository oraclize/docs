# Security

Since Oraclize acts as a data carrier, the service could potentially tamper the result and provide some wrong data (different from the one provided by the chosen datasource). In order to avoid this dishonest behaviour, we optionally provide cryptographic proofs showing that this didn't happen.

These **honesty proofs**, as we call them, are generated via different methodologies (based on different forms of SW/HW attestation) which provide you strong authenticity guarantees.

Some of those proofs are based on external projects we leverage, while others were designed by us in-house in order to make our service more and more secure.

We are listing here the honesty proofs that Oraclize provides. Other than the original TLSNotary-based one, we have others in the workings which will be released in the coming weeks.

## Proofs Storage & delivery
### <a href="https://ipfs.io/" target="_blank">IPFS</a>
In some circumstances you might want to avoid including the raw proof data into your response. One reason could be the fact that the delivery method you choose is expensive (i.e.: Ethereum transactions).
IPFS can be used as storage & delivery method, by making the proof data both permanent and persistent.

IPFS enables the permanence of the proof data by design. This means that your query result can include the multihash of the proof data only, while the actual content can be pinned to IPFS nodes and float around the network whenever you try reaching such a multihash-addressed content.

IPFS doesn't provide by itself any persistency guarantee, however we run as part of our infrastructure a <a href="https://github.com/oraclize/ipfs-persistence-consortium" target="_blank">IPFS persistence consortium</a>.

You can help in keeping an independent copy of our proofs data by pointing your <a href="https://github.com/oraclize/ipfs-persistence-consortium" target="_blank">IPFS persistence consortium</a> node to the following aggregation peer: `QmSsSSfJAJwj3jsNfzbSrxtLAjhpYPjbUEsCQT8mWVgBiL`


## TLSNotary proof

TLSNotary is a project implementing a modification of TLS. By using it you can prove that a certain server has really sent some data to you at a given point in time.

Pagesigner is a TLSNotary-based system which is designed to generate a distributable proof that anybody can use to indipendently verify the authenticity of a TLS response.

Oraclize provides the above proof, along with the result, so that you can be 100% sure that we are behaving honestly and that our response is really coming from a certain server at a specific time.

## Android proof

In <a href="http://ipfs.io/ipfs/QmWt9AZ3imf5eJsLUCPYmz1tNUD5TuLwMfcQsx8ai7z7Ud" target="_blank">this whitepaper</a>, we present a new experimental proof-of-honesty which uses a physical Android device as a secure environment
for creating successful HTTPS connections. Guarantees of security, as well as the capability to prove this security to a third party, come from the use of SafetyNet Software Attestation and Android Hardware Attestation. SafetyNet provides guarantees that root certificate authorities have not been tampered with, and Android Hardware Attestation provides proof that the private key used to sign the data is hardware-backed, that the device is updated, and that the device's Root-Of-Binding-Trust is valid.

<aside class="notice">
Please note that this authenticity proof is experimental and that the white paper has been published for community review.
</aside>

