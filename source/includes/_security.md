# Security Deep Dive
As digital technologies have reduced the barrier to entries for information creation and distribution, it has become extremely important to be able to authenticate a piece of information as originating from a known, trusted source.

In the context of web technologies, _authentication_ is provided by the HTTPS protocol, an extension of the HTTP protocol which create an encrypted and authenticated channel between the client and the web-server containing the data.

When dealing with data which could be used to determine different financial transactions, authentication becomes of fundamental importance. Unfortunately, the most used and available blockchain protocols have no direct way of interacting with HTTPS and therefore digesting authenticated data. It would seem then that there is a need for a trusted service which can provide this data or complete actions based on it; but that would in part defeat the point of having a decentralized protocol for exchanging value *without* trusted parties.

This is the reason why Oraclize has been designing systems for authenticating data and made it part of its core business. These systems are called *authenticity proofs*, which enable auditability of the oracle's service record in delivering untampered data.
The authenticity proofs leverage different attestation technologies: some are software-based and some rely on trusted hardware technologies.

## Authenticity Proofs Types

### TLSNotary Proof
The TLSNotary Proof leverages a feature of the TLS 1.0 and 1.1 protocols which enables the splitting of the TLS master key between three parties: the server, an auditee and an auditor. In this scheme, Oraclize is the auditee while a locked-down AWS instance of a specially-designed, open-source Amazon Machine Image acts as the auditor. The TLSNotary protocol is an open-source technology, developed and used by the PageSigner project.

### Android Proof
The Android Proof is a result of some of Oraclize's internal R&D work. It leverages software remote attestation technology developed by Google, called SafetyNet, to validate that a given Android application is running on a safe, non-rooted physical device, connected to Oraclize's infrastructure. It also remotely validates the application code hash, enabling authentication of the application running on the device. The application code is open-source, thereby enabling auditability and verification of the code hash. The Android Proof goes further, by using the newly introduced Android Hardware Attestation to prove that the physical device is updated to the latest available Android version, further ensuring integrity by having any potential exploits within the system patched. Furthermore, it verifies that the device's Root-of-Binding-Trust is valid. Both these technologies together effectively turn the physical Android device into a provably-secure environment in which an untampered HTTPS connection to a remote datasource can be initiated. For Oraclize or an external attacker with unauthorized gained access to the infrastructure to compromise the device and generate a false but valid proof, a zero-day exploit unbeknownst to Google must be discovered by said party, which either breaks the Android sandboxing model or is a kernel-level exploit, of the latest version of Android OS and its available security patches.
You can access more information about the Android Proof by reading the white paper on it and experiment with it on the Ethereum and Bitcoin testnets. The enabling of the Android Proof on mainnet is pending based on an update by Google, effectively enabling Android Nougat Hardware Attestation.


### Ledger Proof

<a href="https://www.ledger.co">Ledger</a> is a French company, leader in the production of hardware-enforced cryptocurrency wallets. Their main products are the Ledger Nano S and the Ledger Blue. Both devices implement a common platform comprising a STMicroelectronics secure element, a controller and an operating system called BOLOS.
The BOLOS SDK enables developer to build applications which can be installed on the secure hardware along with the cryptocurrency wallet, which are BOLOS application themselves.
BOLOS exposes a set of kernel-level API which can complete useful operations such as cryptographic ones or attestation. Attestation is in fact one of the most interesting aspect of the platform: any application can, by calling the appropriate API, ask the kernel to measure its binary and produce a signed hash. The signing is performed by a special attesting key, which is controlled by the kernel and it is out of reach of the application developers. The attesting key has full chain of trust which has the root in a Ledger-controlled master key, residing on an HSM controlled by Ledger.

The Ledger Proof leverages both the code attesting and the device attesting features to attest to any third-party that the applications developed by Oraclize are running in a TEE of a true Ledger device. The Ledger Proof has the following format:

<table>
<thead>
<tr>
<th>1</th>
<th>2</th>
<th>3</th>
<th>4</th>
</tr>
</thead>
<tbody>
<tr>
<td>3 bytes</td>
<td>65 bytes</td>
<td>var length</td>
<td>...</td>
</tr>
<tr>
<td>'LP\x01' (prefix)</td>
<td>APPKEY1 PubKey</td>
<td>APPKEY1 cert (CA:Ledger)</td>
</tr></tbody></table>

1. A prefix to indicate proof type and versioning
2. The attesting key `app_key_1` of the device.
3. Signature by the Ledger Root Key over the `app_key_1`
4. The data and signatures of the application

The Ledger Proof is currently used by the Oraclize Random Data Source to provide untampered entropy to smart-contracts, blockchain and non-blockchain applications.

### Storage and Delivery
The authenticity proofs may be relatively large files, of up to a few kilobytes. Delivering such proofs directly within the result of the data payload in an Ethereum transaction can get quite expensive, in terms of EVM execution costs, and may even be impossible for larger data.

Moreover, Oraclize strives to be blockchain agnostic, enabling the proof to be used even on Bitcoin and other blockchains. Therefore the proof is uploaded and saved to IPFS, a decentralized and distributed storage system. In providing a pointer to the content, IPFS uses a custom hashing algorithm called multihash. The resulting address is Base64 encoded and it's a unique ID specific to the file which can be used to access it globally, and changes along with any edits to the file contained.

IPFS, by itself, doesn't provide any long-term guarantees of persistency, however as part of Oraclize's infrastructures it runs the <a href="https://github.com/oraclize/ipfs-persistence-consortium" target="_blank">IPFS persistence consortium</a>. Anyone can join Oraclize's consortium and help in keeping an independent copy of all the proofs by pointing a <a href="https://github.com/oraclize/ipfs-persistence-consortium" target="_blank">IPFS persistence consortium</a> node to the following aggregation peer: `QmSsSSfJAJwj3jsNfzbSrxtLAjhpYPjbUEsCQT8mWVgBiL`

## Advanced Data Sources

### Random Data Source
The Oraclize Random Data Source leverages the Ledger Proof and a custom application to generate unbiased random numbers and provide them on demand to blockchain and non-blockchain based applications. The end applications can perform verification step to unsure that the randomness provided was truly generated in an secure hardware environment provided by a Ledger Nano S.

This section will shortly explain the rationale and the inner workings of the custom application.

The main goals of the design were:

1. Oraclize can only ask once, for a specific request, a random number to the device. Subsequent requests should be denied or return the previously extracted number.
2. The random number must be signed, to authenticate that has been generated by the device.
3. In blockchain applications, miners shouldn't be able to tamper with orders, validity and results of the bets
4. The design should minimize use of state both on the device and on-chain.

The architecture achieves these goals by:

1. Enforcing the uniqueness of each request id. The device keeps a merkelized, append-only state where each request seen is appended.
2. All data coming from the device is signed by an application session key, whose public key is present in the Oraclize connector. Requests can commit to receive the result by a precise session key.
3. Commitment data is send along with the request, to anchor it to a specific blockchain history. Commitment data can be derived by the current block information such as timestamp, coinbase and previous block hash, and additionally information related to the request (msg.sender, msg.value etc).
4. The kernel has an event feature which it is used to increment an application internal timer. A request can and should specify a time, in seconds, which has to elapse before the request can be served by the device and the random number returned. The higher the specifier time, the stronger the security against miners, with or without Oraclize collaboration, tampering with the result.  
5. The random bytes are generated from the commitment data and the session private key using the ECDSA deterministic signing; this avoids costly recomputation of the tree to mark served query.

The validity of these operations is enforced by the Ledger Proof. Signatures and data related to the Random Data Source are in fact append to the Ledger Proof and returned with the result. The format of the appended data is the following one:
<table>
<thead>
<tr>
<th>1</th>
<th>2</th>
<th>3</th>
<th>4</th>
<th>5</th>
<th>6</th>
<th>7</th>
<th>8</th>
</tr>
</thead>
<tbody>
<tr>
<td>32 bytes</td>
<td>32 bytes</td>
<td>8 bytes</td>
<td>1 byte</td>
<td>32 bytes</td>
<td>var length</td>
<td>65 bytes</td>
<td>var length</td>
</tr>
<tr>
<td>CODEHASH</td>
<td>keyhash</td>
<td>timelock</td>
<td>Nbytes</td>
<td>user nonce</td>
<td>SessionKey sig</td>
<td>SessionPubKey</td>
<td>attestation sig</td>
</tr></tbody></table>

1. The SHA-256 of the application binary, measured by the BOLOS kernel
2. The uniqueId hash
3. The time which has to elapse before the request can be answered
4. The number of random bytes which have to be returned
5. The commitment data, chosen by the developer
6. The signature of the application session key over the request data
7. The application session public key
8. The signature of `app_key_1`, the attesting key, over the codehash and the session public key

An in-depth explanation of the Random Data Source and an analysis of the attack scenarios can be consulted in the released paper.
