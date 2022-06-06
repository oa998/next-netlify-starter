import axios from "axios";
import { useRef } from "react";

// export interface IProps {
//   acceptedFileTypes?: string;
//   allowMultipleFiles?: boolean;
//   label: string;
//   onChange: (formData: FormData) => void;
//   uploadFileName: string;
// }

export default (props) => {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  const onChange = async (formData) => {
    const config = {
      headers: { "content-type": "multipart/form-data" },
      onUploadProgress: (event) => {
        console.log(
          `Current progress:`,
          Math.round((event.loaded * 100) / event.total)
        );
      },
    };

    const response = await axios.post("/api/upload", formData, config);

    console.log("response", response.data);
  };

  const onClickHandler = () => {
    fileInputRef.current?.click();
  };

  const onChangeHandler = (event) => {
    if (!event.target.files?.length) {
      console.error("no files present");
      return;
    }

    const formData = new FormData();

    Array.from(event.target.files).forEach((file) => {
      formData.append(event.target.name, file);
    });

    onChange(formData);

    formRef.current?.reset();
  };

  return (
    <form ref={formRef}>
      <button type='button' onClick={onClickHandler}>
        Upload
      </button>
      <input
        accept={props.acceptedFileTypes}
        multiple={props.allowMultipleFiles}
        name={"uploaded-file"}
        onChange={onChangeHandler}
        ref={fileInputRef}
        style={{ display: "none" }}
        type='file'
      />
    </form>
  );
};

// UiFileInputButton.defaultProps = {
//   acceptedFileTypes: "",
//   allowMultipleFiles: false,
// };
