# Security Deep Dive 
As digital technologies have reduced the barrier to entries for information creation and distribution, it has become extremely important to be able to authenticate a piece of information as originating from a known, trusted source. 

In the context of web technologies, _authentication_ is provided by the HTTPS protocol, an extension of the HTTP protocol which create an encrypted and authenticated channel between the client and the web-server containing the data.

When dealing with data which could be used to determine different financial transactions, authentication becomes of fundamental importance. Unfortunately, the most used and available blockchain protocols have no direct way of interacting with HTTPS and therefore digesting authenticated data. It would seem then that there is a need for a trusted service which can provide this data or complete actions based on it; but that would in part defeat the point of having a decentralized protocol for exchanging value *without* trusted parties. 

This is the reason why Oraclize has been designing systems for authenticating data and made it part of its core business. These systems are called *authenticity proofs*, which enable auditability of the oracle's service record in delivering untampered data. 
The authenticity proofs leverage different attestation technologies: some are software-based and some rely on trusted hardware technologies. 

## Authenticity Proofs

### TLSNotary Proof
The TLSNotary Proof leverages a feature of the TLS 1.0 and 1.1 protocols which enables the splitting of the TLS master key between three parties: the server, an auditee and an auditor. In this scheme, Oraclize is the auditee while a locked-down AWS instance of a specially-designed, open-source Amazon Machine Image acts as the auditor. The TLSNotary protocol is an open-source technology, developed and used by the PageSigner project.

### Android Proof
The Android Proof is a result of some of Oraclize's internal R&D work. It leverages software remote attestation technology developed by Google, called SafetyNet, to validate that a given Android application is running on a safe, non-rooted physical device, connected to Oraclize's infrastructure. It also remotely validates the application code hash, enabling authentication of the application running on the device. The application code is open-source, thereby enabling auditability and verification of the code hash. The Android Proof goes further, by using the newly introduced Android Hardware Attestion to prove that the physical device is updated to the latest available Android version, further ensuring integrity by having any potential exploits within the system patched. Furthermore, it verifies that the device's Root-of-Binding-Trust is valid. Both these technologies together effectively turn the physical Android device into a provably-secure environment in which an untampered HTTPS connection to a remote datasource can be initiated. For Oraclize or an external attacker with unauthorized gained access to the infrastructure to compromise the device and generate a false but valid proof, a zero-day exploit unbeknownst to Google must be discovered by said party, which either breaks the Android sandboxing model or is a kernel-level exploit, of the latest version of Android OS and its available security patches.
You can access more information about the Android Proof by reading the white paper on it and experiment with it on the Ethereum and Bitcoin testnets. The enabling of the Android Proof on mainnet is pending based on an update by Google, effectively enabling Android Nougat Hardware Attestation.

### Storage and Delivery
The authenticity proofs may be relatively large files, of up to a few kilobytes. Delivering such proofs directly within the result of the data payload in an Ethereum transaction can get quite expensive, in terms of EVM execution costs, and may even be impossible for larger data. 

Moreover, Oraclize strives to be blockchain agnostic, enabling the proof to be used even on Bitcoin and other blockchains. Therefore the proof is uploaded and saved to IPFS, a decentralized and distributed storage system. In providing a pointer to the content, IPFS uses a custom hashing algorithm called multihash. The resulting address is Base64 encoded and it's a unique ID specific to the file which can be used to access it globally, and changes along with any edits to the file contained. 

IPFS, by itself, doesn't provide any long-term guarantees of persistency, however as part of Oraclize's infrastructures it runs the <a href="https://github.com/oraclize/ipfs-persistence-consortium" target="_blank">IPFS persistence consortium</a>. Anyone can join Oraclize's consortium and help in keeping an independent copy of all the proofs by pointing a <a href="https://github.com/oraclize/ipfs-persistence-consortium" target="_blank">IPFS persistence consortium</a> node to the following aggregation peer: `QmSsSSfJAJwj3jsNfzbSrxtLAjhpYPjbUEsCQT8mWVgBiL`


