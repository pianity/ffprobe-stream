import { spawn } from "child_process";
import { Readable } from "stream";

export type FFrobeResult = {
    programs: [],
    streams: [{ width: number, height: number }],
};

export default function ffprobe<T = FFrobeResult>(fileStream: Readable, options: string[] = ["-show_entries", "stream=width,height"]): Promise<T> {
    const ffprobeProcess = spawn("ffprobe", ["-v", "error", "-select_streams", "v:0", ...options, "-of", "json", "-"])

    // Getting STDOUT
    let result = "";

    ffprobeProcess.stdout.on('data', (data) => {
        result += data
    });

    // Getting STDERR
    let error = "";

    ffprobeProcess.stderr.on('data', (data) => {
        error += data;
    });

    // Pipe stream in ffprobe stdin
    fileStream.pipe(ffprobeProcess.stdin)

    ffprobeProcess.stdin.on('error', (err: { code: string }) => {
        if (err.code == "EPIPE") {
            // Ignoring Broken ffprobe stdin broken pipe error
        }
    });

    // Return JSON as a promise
    return new Promise((res, rej) => {
        ffprobeProcess.on('close', (code) => {
            if (code) {
                rej(new Error(`child process exited with code ${code}\nstderr: ${error}`));
            } else {
                res(JSON.parse(result));
            }
        });
    });
}
