# Security
As digital technologies have reduced the barrier to entries for information creation and distribution, it has become extremely important to be able to authenticate a piece of information as originating from a known, trusted source. 

In the context of the web technologies, _authentication_ is provided by the HTTPS protocol, an extension of the HTTP protocol which create an encrypted and authenticated channel between the client and the web-server containing the data.

When dealing with data which could be used to determinate different financial transactions, authentication becomes of fundamental importance. Unfortunately, the most used and available blockchain protocols have no direct-way of interacting with HTTPS and therefore digest authenticated data. It would seems that we then need a trusted service which can provide data or complety actions according to data but that, we believe, would in part defeat the point of having decentralized protocol for exchanging value *without* trusted parties. 

This is the reason why Oraclize has made designing systems for authenticating data its core business. We call these systems *authenticity proofs*, and they enable easy auditability of our service good record in delivering untampered data. 
The authenticity proofs leverage different attestation technologies: some are software based and some relay on trusted hardware technologies. 

## TLSNotary Proof
The TLSNotary Proof leverages a feature of the TLS 1.0 and 1.1 protocol which enables the split of the TLS master key between three parties: the server, an auditee and an auditor. In this scheme, Oraclize is the auditee while a lockdown AWS instance of a specially-designed, open-source Amazon Machine Image acts as the auditor. The TLSNotary protocol is an open-source technology, developed by .. and used as well by the PageSigner project.

# Android Proof
The Android Proof is the result of an internal Oraclize R&D work. It leverages a software remote attestation technology developed by Google, called SafetyNet, to validate that a given Android application is running on safe, non-rooted physical device, connected to our infrastructure. It also validate remotely the application code hash, enabling authentication of the application running on the device. The application code is open-source, there enabling auditability and open verification of the code hash. The Android Proof goes further, by using the newly introduced Android Hardware Attestion to prove that the physical device is updated to the lasted available Android version and that the device's Root-of-Binding-Trust is valid. Both these technology together effectevly turn the physical Android device in a provably secure environment in which a untampered HTTPS connection to a remote datasource can be initiated. For Oraclize, or an external attacker, to compromise the device and generate a false but valid proof, we would have to find an exploit unknown by Google, which either breaks the Android sandboxing model or its a kernel level exploit, of the last available version of Android OS, with the last available security patch.   
You can access more information about the Android Proof by reading our whitepaper and you can play with it on the Ethereum and Bitcoin testnets. The enabling of the Android Proof on mainnet is pending an update by Google, effectevly enabling the Android N Hardware Attestation.

## Storage and Delivery of the Authenticity Proofs
The authenticity proof can be, relatively, large files, of up to few kBs. Delivering such a proof directly with the result in data payload of an Ethereum transaction it would be extremely expensive and sometimes just impossible. Moreover, at Oraclize we strive to be blockchain agnostic, enabling our proof to be used even on Bitcoin and other blockchains.

Therefore the proof is saved and upload on IPFS, a decentralized and distributed storage system. To address the content, IPFS uses a custom hashing algorithm called multihash. The resulting address is Base64 encoded and its the unique ID which can b used to access the file. 

IPFS doesn't provide by itself any long-term persistency guarantee, however we run as part of our infrastructure the <a href="https://github.com/oraclize/ipfs-persistence-consortium" target="_blank">IPFS persistence consortium</a>.

You can help in keeping an independent copy of our proofs data by pointing your <a href="https://github.com/oraclize/ipfs-persistence-consortium" target="_blank">IPFS persistence consortium</a> node to the following aggregation peer: `QmSsSSfJAJwj3jsNfzbSrxtLAjhpYPjbUEsCQT8mWVgBiL`


