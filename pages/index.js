import { Avatar, Badge, Container, Group, Stack } from "@mantine/core";
import axios from "axios";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { durationSince } from "util/date";

const Tags = {
  SLEEPING: "Sleeping",
  PROBABLY: "Probably",
  YES: "Yes",
};

const getTag = (cat, durations, ping) => {
  // if (new Date().getUTCHours() > 2 || new Date().getUTCHours() < 12) {
  //   // after 10pm or before 8pm
  if (ping.door?.closed) {
    if (ping[cat].lastLocation === "inside") {
      return Tags.SLEEPING;
    }
  }
  // }
  if (durations.hr > 5) return Tags.PROBABLY;
  if (durations.hr < 5) return Tags.YES;
};

const getColor = (tag) => {
  switch (tag) {
    case Tags.SLEEPING:
      return "blue";
    case Tags.PROBABLY:
      return "orange";
    default:
      return "green";
  }
};

export default function Home() {
  const [images, setImages] = useState([]);
  const [ping, setPing] = useState({});
  const [processedCats, setProcessedCats] = useState([]);

  useEffect(() => {
    // get images to show
    axios("/api/list").then(({ data }) => {
      const { files } = data;
      const i = files.map((url) => {
        const filename = url.split("/").slice(-1)[0];
        const cats = filename.split("_")[0];
        const time = new Date(+filename.split("_")[1]).toLocaleString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return {
          url,
          filename,
          originalTime: +filename.split("_")[1],
          time,
          cats,
        };
      });
      setImages(i);
    });

    // get cat latest state
    axios("/api/ping").then(({ data }) => {
      /*
        {
          "arya": {
            "lastLocation": "inside",
            "lastTime": 1654544893816
          },
          "nook": {
            "lastLocation": "outside",
            "lastTime": 1654546100615
          },
          "pik": {
            "lastLocation": "outside",
            "lastTime": 1654544893816
          },
          "door": {
            "closed": false
          }
        }
      */
      const cats = data;

      setPing(cats);
    });
  }, []);

  useEffect(() => {
    const processed = Object.entries(ping)
      .filter(([key]) => key !== "door")
      .map(([cat, obj]) => {
        const durations = durationSince(obj.lastTime);
        const time =
          Math.round((durations.hr + durations.min / 60) * 100) / 100;
        let dur = "";
        if (time > 1) {
          dur = `${time} Hours Ago`;
        } else if (durations.hr === 1) {
          dur = `${durations.hr} Hour Ago`;
        } else if (durations < 2) {
          dur = "Just Now!";
        } else {
          dur = `${durations.min} Mins Ago`;
        }

        const tag = getTag(cat, durations, ping);
        const color = getColor(tag);
        return {
          [cat]: {
            duration: dur,
            tag,
            color,
          },
        };
      });
    setProcessedCats(processed);
  }, [ping]);

  const favicon = useMemo(() => {
    const r = Math.random();
    if (r < 0.3333) return "/arya.ico";
    if (r < 0.6666) return "/nook.ico";
    return "/pik.ico";
  }, []);

  return (
    <Container size='lg' px='lg'>
      {/* <div style={{ paddingBottom: "100px" }}> */}
      <Head>
        <title>AMCA</title>
        <link rel='icon' href={favicon} />
      </Head>

      <main
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr",
        }}
      >
        <h1
          style={{ margin: "30px 0", textAlign: "center", fontSize: "2.5em" }}
        >
          Are My Cats Alive?!
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            maxWidth: "100%",
            margin: "30px 0 60px 0",
            flexDirection: "column",
          }}
        >
          <Group sx={{ width: "100%", justifyContent: "center" }}>
            {processedCats
              .slice()
              .map((json) => Object.entries(json)[0])
              .sort((a, b) => {
                // first element is cat's name, 2nd element is cat data
                return a[0].localeCompare(b[0]);
              })
              .map(([cat, data]) => {
                return (
                  <Badge
                    sx={{
                      paddingLeft: 0,
                      height: "max-content",
                      width: "max-content",
                    }}
                    size='lg'
                    radius='xl'
                    color={data.color || "green"}
                    key={cat}
                    leftSection={
                      <Avatar
                        src={`/uploads/${cat.toUpperCase()}.png`}
                        radius='xl'
                        size='lg'
                      />
                    }
                  >
                    <Stack align={"center"} spacing={0}>
                      <div
                        style={{
                          lineHeight: "1.5em",
                          padding: "0 20px",
                        }}
                      >
                        <u>{data.tag}</u>
                      </div>
                      <div
                        style={{
                          lineHeight: "1.2em",
                          fontSize: "0.6em",
                          padding: "0 20px",
                        }}
                      >{`Last seen: ${data.duration}`}</div>
                    </Stack>
                  </Badge>
                );
              })}
          </Group>
          <Badge
            sx={{
              margin: "10px 0",
              width: "80%",
              alignSelf: "center",
              backgroundColor: "black",
            }}
          >
            Door Closed
          </Badge>
        </div>
      </main>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(250px, 50%)",
          justifyContent: "center",
          gap: "30px",
        }}
      >
        <div style={{ color: "white", textAlign: "center" }}>
          Latest Pictures:
        </div>
        {images
          .slice()
          .sort((a, b) => b.originalTime - a.originalTime)
          .map((image) => {
            return (
              <div
                style={{
                  width: "100%",
                  background: "black",
                  color: "white",
                  padding: "5px",
                  borderRadius: "15px",
                }}
                key={image.url}
              >
                <img
                  src={image.url}
                  alt={image.filename}
                  key={image.url}
                  style={{
                    width: "100%",
                    objectFit: "contain",
                    borderRadius: "15px",
                  }}
                />
                <Group style={{ padding: "5px" }}>
                  {image.cats.split("").map((letter) => {
                    if (letter === "a") return <Badge>Arya</Badge>;
                    if (letter === "n") return <Badge>Nook</Badge>;
                    if (letter === "p") return <Badge>Pik</Badge>;
                  })}
                </Group>
                <div
                  style={{
                    width: "100%",
                    textAlign: "right",
                    paddingRight: "5px",
                    fontSize: "1em",
                  }}
                >
                  {image.time}
                </div>
              </div>
            );
          })}
      </div>
      {/* </div> */}
    </Container>
  );
}
