import useSigner from "state/signer";
import AddressAvatar from "./AddressAvatar";
import { Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";

const ConnectButton = () => {
  const { address, loading, connectWallet } = useSigner();

  if (address) return <AddressAvatar address={address} />;

  return (
    <Button
      type="primary"
      shape="circle"
      onClick={connectWallet}
      loading={loading}
    >
      {loading ? "" : <FontAwesomeIcon icon={faWallet} />}
    </Button>
  );
};

export default ConnectButton;
