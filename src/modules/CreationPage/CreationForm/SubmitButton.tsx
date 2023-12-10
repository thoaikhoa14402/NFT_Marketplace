import { useFormikContext } from "formik";
import Button from "../../../components/Button";

const SubmitButton = () => {
  const { isSubmitting, submitForm } = useFormikContext();

  return (
    <Button loading={isSubmitting} onClick={submitForm} className="bg-primary text-white p-4 font-semibold rounded-md">
      MINT NFT
    </Button>
  );
};

export default SubmitButton;
