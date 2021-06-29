#!/usr/bin/env node

const stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

const reverse = !!process.argv.find(e => e === '-r');

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    if (chunk.length) {
        inputChunks.push(chunk);
    }
});

function wrapIntoBunyan(data, time) {
    return {
        name: "bunyan-log-sort-wrapper",
        hostname: "???",
        pid: "???",
        level: 20,
        msg: data,
        time,
        v: 0
    }
}

function reviver(k, v) {
    if (k === 'time') {
        return new Date(v);
    } else {
        return v;
    }

}

stdin.on('end', function () {
    const inputData = inputChunks.join("").split(/\r\n|\n/);
    const validLines = [];
    let previousTs = new Date(0);
    let partialJson = [];
    for (let line of inputData) {
        if (line) {
            try {
                line = JSON.parse(line, reviver);
                if (!line.time) {
                    line.time = new Date(previousTs.getTime() + 1);
                }
                previousTs = line.time;
                validLines.push(line);
            } catch (e) {
                // Line not parseable, is it split or just arbitrary data ?
                if (line.startsWith('{"name":') || partialJson.length) {
                    partialJson.push(line)
                    if (partialJson.length > 1) {
                        try {
                            line = JSON.parse(partialJson.join(""), reviver);
                            validLines.push(line);
                            partialJson.length = 0;
                        } catch (err) {
                        }
                    }
                } else {
                    // Wrap arbitrary data into bunyan format
                    const time = new Date(previousTs.getTime() + 1);
                    validLines.push(wrapIntoBunyan(line, time));
                    previousTs = time;
                }
            }
        }
    }

    if (partialJson.length) {
        for (const invalidJson of partialJson) {
            // Wrap remaining arbitrary data into bunyan format
            const time = new Date(previousTs.getTime() + 1);
            validLines.push(wrapIntoBunyan(invalidJson, time));
            previousTs = time;
        }
    }

    for (const l of validLines) {
        if (!l.time.getTime) {
            console.log(l);
        }
    }

    validLines.sort((a, b) => {
        if (reverse) {
            return b.time.getTime() - a.time.getTime();
        } else {
            return a.time.getTime() - b.time.getTime();
        }
    });

    const outputJSON = validLines.map(JSON.stringify).join('\n');
    stdout.write(outputJSON);
    stdout.write('\n');
});
