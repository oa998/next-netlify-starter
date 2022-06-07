import { Avatar, Button, Group, Switch } from "@mantine/core";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const getButtonVariant = (pet, location, oldPing, newPing) => {
  if (newPing[pet]?.lastLocation === location) return "filled";
  if (oldPing[pet]?.lastLocation === location) return "light";
  return "subtle";
};

export default (props) => {
  const [doorClosed, setDoorClosed] = useState(false);

  const [lastPing, setLastPing] = useState({
    arya: {
      lastLocation: "inside",
      lastTime: 1654544893816,
    },
    nook: {
      lastLocation: "outside",
      lastTime: 1654546100615,
    },
    pik: {
      lastLocation: "outside",
      lastTime: 1654544893816,
    },
    door: {
      closed: false,
    },
  });
  const [currentPing, setCurrentPing] = useState({});

  const update = useCallback((cat, location, doorIsClosed) => {
    if (cat && location) {
      setCurrentPing((curr) => ({
        ...curr,
        [cat]: {
          lastLocation: location,
          lastTime: Date.now(),
        },
      }));
    } else if (doorIsClosed !== undefined) {
      setCurrentPing((curr) => ({
        ...curr,
        door: {
          closed: doorIsClosed,
        },
      }));
    }
  }, []);

  const submit = useCallback(() => {
    axios
      .post("/api/ping", currentPing)
      .then((r) => {
        document.querySelector("#feedback").innerText = JSON.stringify(
          r.data,
          null,
          2
        );
      })
      .catch((e) => {
        document.querySelector("#feedback").innerText = JSON.stringify(
          e.response.data,
          null,
          2
        );
      });
  }, [currentPing]);

  useEffect(() => {
    axios("/api/ping").then(({ data }) => {
      setLastPing(data);
      setDoorClosed(data.door.closed);
    });
  }, []);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "60px repeat(2, 3fr)",
          // gridTemplateRows: "repeat(3, 1fr)",
          gridTemplateAreas:
            '"avatar inside outside" "avatar inside outside" "avatar inside outside" ". . ." ". doorSwitch submit"',
          justifyItems: "stretch",
          alignItems: "center",
          gap: "20px",
          padding: "20px 40px",
          maxWidth: "800px",
        }}
      >
        <Avatar src='/uploads/ARYA.png' radius='xl' size='lg' />

        <Button
          color='green'
          variant={getButtonVariant("arya", "inside", lastPing, currentPing)}
          onClick={() => update("arya", "inside")}
        >
          Arya Inside
        </Button>

        <Button
          color='blue'
          variant={getButtonVariant("arya", "outside", lastPing, currentPing)}
          onClick={() => update("arya", "outside")}
        >
          Arya Outside
        </Button>

        <Avatar src='/uploads/NOOK.png' radius='xl' size='lg' />

        <Button
          color='green'
          variant={getButtonVariant("nook", "inside", lastPing, currentPing)}
          onClick={() => update("nook", "inside")}
        >
          Nook Inside
        </Button>

        <Button
          color='blue'
          variant={getButtonVariant("nook", "outside", lastPing, currentPing)}
          onClick={() => update("nook", "outside")}
        >
          Nook Outside
        </Button>

        <Avatar src='/uploads/PIK.png' radius='xl' size='lg' />

        <Button
          color='green'
          variant={getButtonVariant("pik", "inside", lastPing, currentPing)}
          onClick={() => update("pik", "inside")}
        >
          Pik Inside
        </Button>

        <Button
          color='blue'
          variant={getButtonVariant("pik", "outside", lastPing, currentPing)}
          onClick={() => update("pik", "outside")}
        >
          Pik Outside
        </Button>

        <div
          style={{
            gridArea: "doorSwitch",
          }}
        >
          <Group>
            <Switch
              size='xl'
              checked={doorClosed}
              onChange={(event) => {
                setDoorClosed(event.currentTarget.checked);
                update(null, null, event.currentTarget.checked);
              }}
            />
            {doorClosed ? "Door Closed" : "Door Open"}
          </Group>
        </div>

        <Button
          style={{
            gridArea: "submit",
          }}
          color='dark'
          onClick={submit}
          disabled={JSON.stringify(currentPing).length < 5}
        >
          Submit
        </Button>
      </div>
      <pre id='feedback' style={{ color: "white", background: "green" }}></pre>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(currentPing, null, 2)}
      </pre>
    </div>
  );
};
