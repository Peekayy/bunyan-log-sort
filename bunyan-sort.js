#!/usr/bin/env node

const stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

console.log(process.argv);
const reverse = !!process.argv.find(e => e === '-r');

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    const inputData = inputChunks.join().split(/\r\n|\n/);
    const validLines = [];
    for (let line of inputData) {
        try {
            line = JSON.parse(line, (k, v) => {
                if (k === 'time') {
                    return new Date(v);
                } else {
                    return v;
                }

            });
            if (line.time) {
                validLines.push(line);
            }
        } catch (e) {
            //console.error(line);
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
