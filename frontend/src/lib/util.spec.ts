import { describe, it, expect } from "vitest";
import { parseCommandLine } from "./util";

function areArraysEqual(arr1: string[], arr2: string[]): string {
  if (arr1.length !== arr2.length) {
    return "arr1.length !== arr2.length";
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return `${arr1[i]} !== ${arr2[i]}`;
    }
  }
  // すべての要素が一致
  return "";
}

describe("parseCommandLine", () => {
  /*
  it("should correctly parse a command line with various arguments", () => {
    const commandLine = `sed  -e 's/hoge/fuga/g' "/mnt/hoge fuga/text"  "\\ []"`;
    const expected = ["sed", "-e", "s/hoge/fuga/g", "/mnt/hoge fuga/text", "\\ []"];
    console.log("commandLine:", commandLine);
    console.log("expected:");
    expected.forEach((e) => console.log(e));

    expect(areArraysEqual(parseCommandLine(commandLine), expected)).toEqual("");
  });
  */

  it("should handle basic commands with single quotes", () => {
    const commandLine = "echo 'Hello World'";
    const expected = ["echo", "Hello World"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });

  it("should handle commands with options", () => {
    const commandLine = "ls -la /home/user";
    const expected = ["ls", "-la", "/home/user"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });

  it("should handle commands with double quotes", () => {
    const commandLine = 'grep "pattern" file.txt';
    const expected = ["grep", "pattern", "file.txt"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });

  it("should handle commands with multiple options and spaces in file names", () => {
    const commandLine = "sed -e 's/old/new/g' \"file with space.txt\"";
    const expected = ["sed", "-e", "s/old/new/g", "file with space.txt"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });

  it("should handle simple copy operations", () => {
    const commandLine = "cp file1.txt file2.txt";
    const expected = ["cp", "file1.txt", "file2.txt"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });

  it("should handle commands with escaped spaces", () => {
    const commandLine = "mkdir new\\ folder";
    const expected = ["mkdir", "new folder"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });

  it("should handle paths with spaces inside quotes", () => {
    const commandLine = 'rm -r "/path/to/directory with spaces"';
    const expected = ["rm", "-r", "/path/to/directory with spaces"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });

  it("should handle text with escaped quotes inside", () => {
    const commandLine = 'echo "Text with \\"escaped quotes\\" inside"';
    const expected = ["echo", 'Text with "escaped quotes" inside'];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });

  it("should handle multiple values with spaces", () => {
    const commandLine = "custom_command -option 'value with spaces' \"another value\"";
    const expected = ["custom_command", "-option", "value with spaces", "another value"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });
  it("should handle escaped characters inside double quotes", () => {
    const commandLine = 'echo "abc\\abbbb"';
    const expected = ["echo", "abc\\abbbb"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });

  it("should handle escaped characters without quotes", () => {
    const commandLine = "echo abc\\abbbb";
    const expected = ["echo", "abcabbbb"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });

  it("should handle escaped characters inside single quotes", () => {
    const commandLine = "echo 'abc\\abbbb'";
    const expected = ["echo", "abc\\abbbb"];

    expect(parseCommandLine(commandLine)).toEqual(expected);
  });
});
