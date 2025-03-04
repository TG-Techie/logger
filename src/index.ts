import { inspect } from "util";

const ansi = new RegExp(
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))",
    "g"
);

export const stripAnsi = (input: string) => input.replace(ansi, "");

export type LogFunc = (
    ...input: (string | object | object[] | unknown)[]
) => void;

export type LogFunction<K extends string> = {
    [a in K]: LogFunc;
};

export type PadType = "PREPEND" | "APPEND";

export type LogConfig = {
    padding: PadType;
    divider: string;
    newLine: string;
    newLineEnd: string;
    color: boolean;
};

export type MethodConfig = {
    label: string;
    newLine?: string;
    newLineEnd?: string;
};

export const createLogger = <A extends string>(
    methods: { [k in A]: string | MethodConfig },
    config: Partial<LogConfig> = {},
    func = console.log
) => {
    // Fill default values incase not overriden by arg
    const completeConfig: LogConfig = {
        ...{
            divider: " ",
            newLine: "├-",
            newLineEnd: "└-",
            padding: "PREPEND",
            color: true,
        },
        ...config,
    };

    // Infer the default method config
    const inferredMethodConfig: MethodConfig = {
        label: "-",
        newLine: completeConfig.newLine,
        newLineEnd: completeConfig.newLineEnd,
    };

    // Convert all string methods to MethodConfig
    const completeMethods: { [k in A]: Required<MethodConfig> } = Object.assign(
        {},
        ...(Object.keys(methods) as A[]).map((a) => {
            if (typeof methods[a] == "string") {
                // Return an inferred MethodConfig
                return {
                    [a]: {
                        ...inferredMethodConfig,
                        ...{
                            label: methods[a],
                        },
                    },
                };
            }

            // Return the MethodConfig that was provided
            return {
                [a]: {
                    ...inferredMethodConfig,
                    ...(methods[a] as MethodConfig),
                },
            };
        })
    );

    // Calculate the max length
    const maxLength = Math.max(
        ...Object.values(completeMethods).map(
            (a) => stripAnsi((a as Required<MethodConfig>).label).length
        )
    );

    return Object.assign(
        {},
        ...Object.keys(completeMethods).map((methodHandle) => {
            const method = completeMethods[methodHandle as A];
            const padding = "".padStart(
                maxLength - stripAnsi(method.label).length,
                " "
            );
            const calcPadding = "".padStart(
                maxLength - stripAnsi(method.newLine).length
            );
            const newLinePadding =
                completeConfig.padding == "PREPEND"
                    ? calcPadding + method.newLine
                    : method.newLine + calcPadding;
            const calcPaddingEnd = "".padStart(
                maxLength - stripAnsi(method.newLine).length
            );
            const paddedPreEnd =
                completeConfig.padding == "PREPEND"
                    ? calcPaddingEnd + method.newLineEnd
                    : method.newLineEnd + calcPaddingEnd;

            const paddedText =
                completeConfig.padding == "PREPEND"
                    ? padding + method.label
                    : method.label + padding;

            return {
                [methodHandle]: (...s: unknown[]) => {
                    func(
                        s
                            .map((value) => {
                                if (typeof value !== "string") {
                                    value = inspect(
                                        value,
                                        false,
                                        3,
                                        completeConfig.color
                                    );
                                }
                                return value;
                            })
                            .join("\n")
                            .split("\n")
                            .map(
                                (value, index, array) =>
                                    (index == 0
                                        ? paddedText + completeConfig.divider
                                        : (array.length - 1 == index
                                              ? paddedPreEnd
                                              : newLinePadding) +
                                          completeConfig.divider) + value
                            )
                            .join("\n")
                    );
                },
            };
        })
    ) as LogFunction<A>;
};
