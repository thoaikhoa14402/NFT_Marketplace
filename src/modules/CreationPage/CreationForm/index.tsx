import { Form, Formik } from "formik";
import * as Yup from "yup";
import FormikInput from "../../../components/Input";
import ImagePicker from "./ImagePicker";
import SubmitButton from "./SubmitButton";
import TextArea from "./TextArea";

export type CreationValues = {
  name: string;
  description: string;
  image?: File;
};

type CreationFormProps = {
  onSubmit: (values: CreationValues) => Promise<void>;
};

export const creationValidationSchema = Yup.object().shape({
  name: Yup.string().required("Must enter a name"),
  description: Yup.string().required("Must enter a description"),
  image: Yup.mixed().test("is_defined", "Must select an image", (value) =>
    Boolean(value)
  ),
});

const CreationForm = ({ onSubmit }: CreationFormProps) => {
  const initialValues: CreationValues = { name: "", description: "" };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={creationValidationSchema}
      validateOnBlur={false}
      validateOnChange={false}
      validateOnMount={false}
      onSubmit={onSubmit}
    >
      <Form className="flex flex-col w-full max-w-xl mx-auto gap-5 py-10">
        <div className="text-2xl text-center mb-8 font-semibold text-primary">Create your NFT</div>
        <ImagePicker name="image" />
        <div className="flex w-full flex-col space-y-1 gap-2">
          <FormikInput name="name" placeholder="NFT Name" className="text-sm" />
          <TextArea name="description" placeholder="Description..." />
          <SubmitButton />
        </div>
      </Form>
    </Formik>
  );
};

export default CreationForm;
