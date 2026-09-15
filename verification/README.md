# Optional developer verification

The website itself needs no npm packages. These checks require Node.js, jsdom and @napi-rs/canvas.

To reproduce, place the extracted website folder at `project` beneath a working directory. From inside `project/verification`, run `npm ci`. From the parent of `project`, run each test using `node project/verification/flows.cjs`, `node project/verification/designer-tests.cjs`, `node project/verification/upload-tests.cjs`, `node project/verification/release-tests.cjs` and `node project/verification/service-worker-tests.cjs`. Create a `qa` directory in that working directory for the JSON outputs.

These are DOM, logic, native image conversion and simulated service-worker tests, not rendered browser or physical device tests.
