import chalk from "chalk";
import { createLogger, LogFunction } from "../src";

const logFn = jest.fn();

describe("Basic Logging", () => {
    let logger: LogFunction<"ok">;

    beforeAll(() => {
        logger = createLogger(
            {
                ok: {
                    label: chalk.greenBright`[OK]`,
                    newLine: "| ",
                    newLineEnd: `\\-`,
                }
            },
            { padding: "PREPEND", color: false },
            logFn
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should log ok", () => {
        logger.ok(
            "This is the best logging library",
            "It's not even a question",
            "It even supports multi\nline logs"
        );
        expect(logFn).toBeCalledWith(
            `${chalk.greenBright`[OK]`} This is the best logging library\n` +
                "  |  It's not even a question\n" +
                "  |  It even supports multi\n" +
                "  \\- line logs"
        );
    });
});

describe("Objects & Arrays", () => {
    let logger: LogFunction<"ok">;

    beforeAll(() => {
        logger = createLogger(
            {
                ok: 'OK'
            },
            { color: false },
            logFn
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("can log objects", () => {
        logger.ok({ hello: "world" });
        expect(logFn).toBeCalledWith("OK { hello: 'world' }");
    });

    it("can log arrays", () => {
        logger.ok(["hello", "world"]);
        expect(logFn).toBeCalledWith("OK [ 'hello', 'world' ]");
    });
});

describe("Prepend vs Append", () => {
    let loggerPrepend: LogFunction<"short" | "longer">;
    let loggerAppend: LogFunction<"short" | "longer">;

    beforeAll(() => {
        loggerPrepend = createLogger(
            {
                short: "SHORT",
                longer: "LONGER",
            },
            { padding: "PREPEND", color: false },
            logFn
        );
        loggerAppend = createLogger(
            {
                short: "SHORT",
                longer: "LONGER",
            },
            { padding: "APPEND", color: false },
            logFn
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should prepend short", () => {
        loggerPrepend.short("Hello world");
        expect(logFn).toBeCalledWith(" SHORT Hello world");
    });
    it("should append short", () => {
        loggerAppend.short("Hello world");
        expect(logFn).toBeCalledWith("SHORT  Hello world");
    });
});

describe("Multiline Wrapping", () => {
    let logger: LogFunction<"plaintext" | "oneline" | "twoline">;

    beforeAll(() => {
        logger = createLogger(
            {
                plaintext: "OK",
                oneline: { label: "OK", newLine: "!" },
                twoline: { label: "OK", newLine: "!", newLineEnd: "!" },
            },
            {},
            logFn
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should log plaintext", () => {
        logger.plaintext("Line 1", "Line 2", "Line 3");
        expect(logFn).toBeCalledWith(
            "OK Line 1\n" + "├- Line 2\n" + "└- Line 3"
        );
    });
    it("should log oneline", () => {
        logger.oneline("Line 1", "Line 2", "Line 3");
        expect(logFn).toBeCalledWith(
            "OK Line 1\n" + " ! Line 2\n" + " └- Line 3"
        );
    });
    it("should log twoline", () => {
        logger.twoline("Line 1", "Line 2", "Line 3");
        expect(logFn).toBeCalledWith(
            "OK Line 1\n" + " ! Line 2\n" + " ! Line 3"
        );
    });
});

describe("Default values", () => {
    let consoleLog: jest.SpyInstance;
    let logger: LogFunction<"default">;

    beforeAll(() => {
        consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
        logger = createLogger({
            default: "OK",
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should log", () => {
        logger.default("Hello world");
        expect(consoleLog).toBeCalledWith(
            "OK Hello world"
        );
    });
});
