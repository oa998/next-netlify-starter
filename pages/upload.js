import { Button, Group, TextInput } from "@mantine/core";
import axios from "axios";
import Compressor from "compressorjs";
import { useCallback, useRef, useState } from "react";
import { Activity, Home } from "tabler-icons-react";

export default (props) => {
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const [hourSubtracted, setHoursSubtracted] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState("");

  const onChange = useCallback(
    async (formData, checks, { width, height }) => {
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
          caption,
          width,
          height,
        },
      };

      axios
        .post("/api/upload", formData, config)
        .then((response) => {
          document.querySelector("#feedback").innerText = "Submitted";
          setTimeout(() => (window.location.pathname = "/"), 1500);
          return response;
        })
        .catch((e) => {
          document.querySelector("#error").innerText = String(e);
        })
        .then(() => setIsUploading(false));
    },
    [hourSubtracted, caption]
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
        const _URL = window.URL || window.webkitURL;
        const file = event.target.files[0];
        const img = new Image();
        const objectUrl = _URL.createObjectURL(file);
        img.onload = function () {
          const [width, height] = [this.width, this.height];

          new Compressor(file, {
            quality: 0.5,
            convertTypes: ["image/webp"],

            // The compression process is asynchronous,
            // which means you have to access the `result` in the `success` hook function.
            success(compressedFile) {
              const formData = new FormData();

              // The third parameter is required for server
              formData.append(event.target.name, compressedFile);
              document.querySelector(
                "#feedback"
              ).innerText = `File reduction by ${Math.round(
                ((file.size - compressedFile.size) / file.size) * 100
              )}%`;
              onChange(formData, checks.map(({ value }) => value).join(""), {
                width,
                height,
              });
            },
            error(err) {
              document.querySelector("#error").innerText = new String(err);
            },
          });
          _URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
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
