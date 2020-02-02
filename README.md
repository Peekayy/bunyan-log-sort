# bunyan-log-sort

Sorts bunyan formatted logs according to their `time` field. This way you can easily concat various bunyan log files and still get the result ordered.

## Installation

### Using yarn
`yarn global add bunyan-log-sort`

## Usage

option `-r` reverses order (Newest last).

`$ cat your.log | bunyan-sort [-r] | bunyan`
