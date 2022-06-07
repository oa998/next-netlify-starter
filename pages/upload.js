import axios from "axios";
import { useRef, useState } from "react";

export default (props) => {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const [hourSubtracted, setHoursSubtracted] = useState(0);

  const onChange = async (formData, checks) => {
    // Send "checks" as a header to easily append to file name for upload. Very hacky
    // also time
    const time = new Date();
    time.setTime(time.getTime() - hourSubtracted * 60 * 60 * 1000);

    const config = {
      headers: {
        "content-type": "multipart/form-data",
        checks,
        time: time.getTime(),
      },
      onUploadProgress: (event) => {
        console.log(
          `Current progress:`,
          Math.round((event.loaded * 100) / event.total)
        );
      },
    };

    const response = await axios
      .post("/api/upload", formData, config)
      .then((response) => {
        document.querySelector("#feedback").innerText = "Submitted";
        setTimeout(() => (window.location.pathname = "/"), 1000);
        return response;
      })
      .catch((e) => {
        const {
          response: { data },
        } = e;
        document.querySelector("#error").innerText = JSON.stringify(
          data,
          null,
          2
        );
      });
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

    const checks = [...document.querySelectorAll('input[type="checkbox"]')]
      .map((x) => ({
        value: x.value,
        checked: x.checked,
      }))
      .filter(({ checked }) => checked);

    if (checks.length === 0) {
      document.querySelector("#error").innerText = "must choose 1 or more cats";
    } else {
      onChange(formData, checks.map(({ value }) => value).join(""));
    }
    formRef.current?.reset();
  };

  return (
    <div
      className='upload-page'
      style={{
        textAlign: "center",
        fontSize: "2em",
        color: "white",
        padding: "30px 0",
      }}
    >
      <form
        ref={formRef}
        // style={{ fontSize: "2em" }}
        onClick={() => {
          document.querySelector("#error").innerText = "";
          document.querySelector("#feedback").innerText = "";
        }}
      >
        <div>
          <input
            type='checkbox'
            id='arya'
            name='pet'
            value='a'
            style={{ width: "20px", height: "20px" }}
          />
          <label htmlFor='arya'>Arya</label>
        </div>
        <br />
        <div>
          <input
            type='checkbox'
            id='nook'
            name='pet'
            value='n'
            style={{ width: "20px", height: "20px" }}
          />
          <label htmlFor='nook'>Nook</label>
        </div>
        <br />
        <div>
          <input
            type='checkbox'
            id='pik'
            name='pet'
            value='p'
            style={{ width: "20px", height: "20px" }}
          />
          <label htmlFor='pik'>Pik</label>
        </div>
        <br />
        <div>
          <input
            type='number'
            id='hours-ago'
            value={hourSubtracted}
            onChange={(e) => setHoursSubtracted(e.target.value || 0)}
            style={{ width: "80px" }}
          />
          <label htmlFor='hours-ago'>Hours ago</label>
        </div>
        <br />
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
      <div id='error' style={{ color: "white", background: "crimson" }}></div>
      <div id='feedback' style={{ color: "white", background: "green" }}></div>
      <br />
      <br />
      <br />
      <div>
        <button
          onClick={() => {
            window.location.pathname = "/";
          }}
        >
          Home
        </button>
      </div>
      <br />
      <div>
        <button
          onClick={() => {
            window.location.pathname = "/ping";
          }}
        >
          Ping
        </button>
      </div>
    </div>
  );
};
