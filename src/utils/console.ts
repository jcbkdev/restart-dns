import { argv } from "node:process";
import { Result } from "../shared/result";

type Primitive = string | number | boolean;

export function readConsoleArgument<T extends Primitive>(
  name: string,
  defaultValue: T,
): T {
  const flagName = "-" + name;

  if (typeof defaultValue === "boolean" && defaultValue === true) {
    throw new Error(
      `Invalid defaultValue for argument "${flagName}": boolean flags must default to false (presence implies true).`,
    );
  }

  for (let i = 0; i < argv.length; i++) {
    const argName = argv[i];

    if (argName === flagName) {
      if (typeof defaultValue === "boolean") {
        return true as T;
      }

      const argValue = argv[i + 1];

      if (!argValue) {
        throw new Error(`Value for argument \"${argName}\" was not provided.`);
      }

      if (typeof defaultValue === "number") {
        const numberArgValue = Number(argValue);

        if (isNaN(numberArgValue)) {
          throw new Error(
            `Value provided for argument "${argName}" is not a number.`,
          );
        }

        return numberArgValue as T;
      }

      return argValue as T;
    }
  }

  return defaultValue;
}
