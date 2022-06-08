import {
  Avatar,
  Badge,
  Container,
  Group,
  Modal,
  Stack,
  Tooltip,
} from "@mantine/core";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Home2, Trees } from "tabler-icons-react";
import { durationSince } from "util/date";

const Tags = {
  SLEEPING: "Sleeping",
  PROBABLY: "Probably",
  YES: "Yes",
};

const Orientation = {
  PORTRAIT: {
    width: 342,
    height: 608,
  },
  LANDSCAPE: {
    width: 768,
    height: 432,
  },
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
  const [selectedImage, setSelectedImage] = useState("");

  const maximizeMe = (event) => {
    setSelectedImage(event.target.src);
  };

  useEffect(() => {
    // get images to show
    axios("/api/list").then(({ data }) => {
      const { files } = data;
      const i = files.map(({ url, orientation }) => {
        const filename = url.split("/").slice(-1)[0];
        const cats = filename.split("_")[0];
        const time = new Date(+filename.split(/[_\.]/g)[1]).toLocaleString(
          "en-US",
          {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );
        return {
          url,
          filename,
          originalTime: +filename.split(/[_\.]/g)[1],
          time,
          cats,
          orientation,
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
    const aryaMax = Math.max(
      ...images.filter((i) => i.cats.includes("a")).map((i) => i.originalTime)
    );
    const nookMax = Math.max(
      ...images.filter((i) => i.cats.includes("n")).map((i) => i.originalTime)
    );
    const pikMax = Math.max(
      ...images.filter((i) => i.cats.includes("p")).map((i) => i.originalTime)
    );

    const pictureTimes = {
      arya: aryaMax || 0,
      nook: nookMax || 0,
      pik: pikMax || 0,
    };

    const processed = Object.entries(ping)
      .filter(([key]) => key !== "door")
      .map(([cat, obj]) => {
        const durations = durationSince(
          Math.max(obj.lastTime, pictureTimes[cat])
        );
        const time =
          Math.round((durations.hr + durations.min / 60) * 100) / 100;
        let dur = "";
        if (time > 1) {
          dur = `${time} Hours Ago`;
        } else if (durations.hr === 1) {
          dur = `${durations.hr} Hour Ago`;
        } else if (durations.min < 2) {
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
            lastLocation: obj.lastLocation,
          },
        };
      });
    setProcessedCats(processed);
  }, [ping, images]);

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
        <Modal
          size='100%'
          opened={!!selectedImage.url}
          onClose={() => setSelectedImage({})}
          align='center'
        >
          {selectedImage.url ? (
            <Image
              src={selectedImage.url}
              alt={selectedImage.filename}
              {...(selectedImage.orientation === "portrait"
                ? Orientation.PORTRAIT
                : Orientation.LANDSCAPE)}
              layout='intrinsic'
              sx={{
                borderRadius: "15px",
              }}
            />
          ) : null}
        </Modal>
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
                    rightSection={
                      <Tooltip
                        position='top'
                        placement='center'
                        gutter={10}
                        label={data.lastLocation}
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        {data.lastLocation === "inside" ? <Home2 /> : <Trees />}
                      </Tooltip>
                    }
                  >
                    <Stack align={"center"} spacing={0}>
                      {data.tag === Tags.SLEEPING ? (
                        <div
                          style={{
                            lineHeight: "1.5em",
                            padding: "0 20px",
                          }}
                        >
                          {data.tag}
                        </div>
                      ) : (
                        <div
                          style={{
                            lineHeight: "1.5em",
                            padding: "0 20px",
                          }}
                        >
                          {`Last seen:`}
                          <br />
                          {data.duration}
                        </div>
                      )}
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
              color: ping.door?.closed ? "hsl(225, 100%, 66%)" : "black",
              backgroundColor: ping.door?.closed ? "black" : "lime",
            }}
          >
            {`Door ${ping.door?.closed ? "Closed" : "Open"}`}
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
        <div style={{ color: "white", textAlign: "center", fontSize: "1.2em" }}>
          Latest Pictures:
        </div>
        {images
          .slice()
          .sort((a, b) => b.originalTime - a.originalTime)
          .map((image) => {
            return (
              <div
                className='img-container'
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  background: "black",
                  color: "white",
                  padding: "5px",
                  borderRadius: "15px",
                }}
                key={image.url}
              >
                <Image
                  src={image.url}
                  alt={image.filename}
                  {...(image.orientation === "portrait"
                    ? Orientation.PORTRAIT
                    : Orientation.LANDSCAPE)}
                  key={image.url}
                  layout='responsive'
                  onClick={() => setSelectedImage(image)}
                />
                <Group style={{ padding: "5px" }}>
                  {image.cats.split("").map((letter) => {
                    if (letter === "a") return <Badge key='arya'>Arya</Badge>;
                    if (letter === "n") return <Badge key='nook'>Nook</Badge>;
                    if (letter === "p") return <Badge key='pik'>Pik</Badge>;
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
