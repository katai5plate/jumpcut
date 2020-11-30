const { readFileSync, writeFileSync } = require("fs");
const { pushCommand } = require("./utils");

module.exports = ({ filename, threshold = 30, time = 400 }) => {
  pushCommand(
    `ffmpeg -i "${filename}.mp4" -af silencedetect=noise=${-Math.abs(
      threshold
    )}dB:d=${Math.abs(time / 1000)} -f null - 2> temp/temp.log.txt`
  );
  const log = readFileSync("./temp/temp.log.txt", { encoding: "utf-8" });
  const meta = log
    .split("\n")
    .filter((v) => v.includes("silence_"))
    .map((v) => v.match(/silence_(.*?): ((?:\d+\.?\d*|\.\d+))/).slice(1));
  let counts = { start: 0, end: 0 };
  meta.forEach(([k]) => {
    if (["start", "end"].includes(k)) return counts[k]++;
    throw new Error("temp.log.txt はバリデーション違反です");
  });
  if (counts.start.length !== counts.end.length)
    throw new Error("temp.log.txt の start/end 数が合いません");
  const list = meta
    .reduce(
      (a, c, i) =>
        i % 2 === 0
          ? [...a, [c]]
          : [...a.slice(0, -1), [...a[a.length - 1], c]],
      []
    )
    .map(([[ak, av], [bk, bv]]) => ({ [ak]: Number(av), [bk]: Number(bv) }));
  const flip = [
    { start: 0, end: list[0].start },
    ...list.map(({ end }, i, s) =>
      s.length === i + 1
        ? { start: end, end: Infinity }
        : { start: end, end: s[i + 1].start }
    ),
  ].filter(({ start }, i) => (i === 0 ? start !== 0 : true));
  writeFileSync("./temp/log.list.json", JSON.stringify(list, null, 2));
  writeFileSync("./temp/log.flip.json", JSON.stringify(flip, null, 2));
  writeFileSync(
    "./temp/temp.trims.txt",
    [...Array(flip.length).keys()]
      .map((i) => `file ${filename}_${i}.mp4`)
      .join("\n")
  );
  flip.forEach(({ start, end }, index) => {
    const command = `ffmpeg -i "${filename}.mp4" ${
      start !== 0 ? `-ss ${start} ` : ""
    }${
      end !== Infinity && !!end ? `-t ${end - start} ` : ""
    }temp/${filename}_${index}.mp4`;
    pushCommand(command);
    console.log(
      `[${filename}] DONE: ${index} / ${flip.length - 1} ... ${Math.floor(
        (index / (flip.length - 1)) * 100
      )}%`
    );
  });
  pushCommand(
    `ffmpeg -f concat -i temp/temp.trims.txt -c copy ${filename}_jumpcut.mp4 -y`
  );
};
