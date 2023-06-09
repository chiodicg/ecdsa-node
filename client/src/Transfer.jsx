import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";

function Transfer({ privateKey, address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    console.log(sendAmount);
    const message = {
      amount: parseInt(sendAmount),
      recipient: recipient,
    };
    const hashedMessage = keccak256(Uint8Array.from(message));
    const signature = secp256k1.sign(hashedMessage, privateKey);
    const fullSignature = new Uint8Array(signature);
    const signatureString = toHex(fullSignature);
    console.log(signatureString);
    const transaction = {
      message: message,
      hash: hashedMessage,
      signature: signature,
    };

    // FInd out how to pass the Signature in the request
    /* It complains cannot stringify BigInt, but the Signature format is actually:
     {r: 108222167931602429053831018373168748927247248315544432854601564291486681784611n
s: 27833371414618603414443786723576292965454020445861752538752665091823005314634n
recovery: 1}


*/
    try {
      const {
        data: { balance },
      } = await server.post(`send`, transaction);
      console.log(balance);

      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address (public key)"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
