import { argv, exit } from "process";
import ffprobe from "../src/index";
import {createReadStream} from "fs";

if (argv.length != 3) {
    console.error("Usage: ffprove_stream_example.ts [file]");
    exit();
}
const stream = createReadStream(argv[2])

ffprobe(stream).then(e => {
    console.log(e.streams[0].width, e.streams[0].height);
}).catch(console.error);
