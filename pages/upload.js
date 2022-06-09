import { Button, Group, SegmentedControl, TextInput } from "@mantine/core";
import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { Activity, Home } from "tabler-icons-react";

export default (props) => {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const [hourSubtracted, setHoursSubtracted] = useState(0);
  const [orientation, setOrientation] = useState("portrait");
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState("");

  const onChange = useCallback(
    async (formData, checks) => {
      // Send "checks" as a header to easily append to file name for upload. Very hacky
      // also time
      const time = new Date();
      time.setTime(time.getTime() - (hourSubtracted || 0) * 60 * 60 * 1000);
      setIsUploading(true);

      const config = {
        headers: {
          "content-type": "multipart/form-data",
          checks,
          time: time.getTime(),
          orientation,
          caption,
        },
        // onUploadProgress: (event) => {
        //   console.log(
        //     `Current progress:`,
        //     Math.round((event.loaded * 100) / event.total)
        //   );
        // },
      };

      const response = await axios
        .post("/api/upload", formData, config)
        .then((response) => {
          document.querySelector("#feedback").innerText = "Submitted";
          setTimeout(() => (window.location.pathname = "/"), 1000);
          return response;
        })
        .catch((e) => {
          document.querySelector("#error").innerText = String(e);
        })
        .then(() => setIsUploading(false));
    },
    [hourSubtracted, orientation, caption]
  );

  const onClickHandler = () => {
    fileInputRef.current?.click();
  };

  const onChangeHandler = useCallback(
    (event) => {
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
        document.querySelector("#error").innerText =
          "must choose 1 or more cats";
      } else {
        onChange(formData, checks.map(({ value }) => value).join(""));
      }
      formRef.current?.reset();
    },
    [onChange]
  );

  return (
    <div
      className='upload-page'
      style={{
        textAlign: "center",
        fontSize: "2em",
        color: "white",
        padding: "30px 0",
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        alignItems: "center",
      }}
    >
      <form
        ref={formRef}
        // style={{ fontSize: "2em" }}
        onClick={() => {
          document.querySelector("#error").innerText = "";
          document.querySelector("#feedback").innerText = "";
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
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
        <Group spacing={20}>
          <input
            type='number'
            id='hours-ago'
            value={hourSubtracted}
            onChange={(e) => setHoursSubtracted(e.target.value)}
            style={{ width: "40px" }}
          />
          <label htmlFor='hours-ago'>Hours ago</label>
        </Group>
        <SegmentedControl
          color='dark'
          value={orientation}
          onChange={setOrientation}
          data={[
            { label: "portrait", value: "portrait" },
            { label: "landscape", value: "landscape" },
          ]}
        />
        <TextInput
          value={caption}
          placeholder='Image Caption'
          onChange={(event) => setCaption(event.currentTarget.value)}
        />
        <Button
          size='xl'
          loading={isUploading}
          loaderPosition='right'
          onClick={onClickHandler}
        >
          Upload
        </Button>
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
      <Button
        size='lg'
        rightIcon={<Home />}
        onClick={() => {
          window.location.pathname = "/";
        }}
      >
        Home
      </Button>
      <Button
        size='lg'
        rightIcon={<Activity />}
        onClick={() => {
          window.location.pathname = "/ping";
        }}
      >
        Ping
      </Button>
    </div>
  );
};
