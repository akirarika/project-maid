import { outputFile, readFileSync } from "fs-extra";
import { compile } from "handlebars";
import { load } from "js-yaml";
import { join } from "path";
import { Uri, window, WorkspaceFolder } from "vscode";
import { execShellScript } from "../helpers";

type createdHook = Array<string>;

export const executeHooksCommand = async (uri: Uri) => {
  try {
  } catch (error) {
    return await window.showErrorMessage("Execute Creators Error: \n" + error);
  }
};

export const executeHooks = async (names: Array<string>, workspace: WorkspaceFolder, templateInnerVars: Record<any, any>) => {
  const hooks: createdHook = [];

  for (const name of names) {
    const path = join(workspace.uri.fsPath, ".pm", "hooks", name);
    let config = load(readFileSync(join(path, "config.yaml"), "utf-8")) as createdHook;
    if (true !== Array.isArray(config)) throw new Error(`"config.yaml"  is not in the expected format: ${path}`);
    hooks.push(...config);
  }

  const commands: Array<string> = [];
  commands.push(`cd ${workspace.uri.fsPath}`);
  for (const iterator of hooks) {
    commands.push(compile(`${iterator}`)(templateInnerVars));
  }
  execShellScript(commands);
};
