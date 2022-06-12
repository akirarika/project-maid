import { outputFile, readFileSync } from "fs-extra";
import { compile } from "handlebars";
import { load } from "js-yaml";
import { join } from "path";
import { Uri, window, WorkspaceFolder } from "vscode";

interface rewritedFile {
  filePath: string;
  rewrite: string;
  jsons?: Array<{
    name: string;
    path: string;
  }>;
}

export const executeCreatorsCommand = async (uri: Uri) => {
  try {
  } catch (error) {
    return await window.showErrorMessage("Execute Creators Error: \n" + error);
  }
};

export const executeCreators = async (names: Array<string>, workspace: WorkspaceFolder, templateInnerVars: Record<any, any>) => {
  const rewritedFiles: Array<rewritedFile> = [];

  for (const name of names) {
    const path = join(workspace.uri.fsPath, ".pm", "creators", name);

    const defaultConfig: rewritedFile = {
      filePath: "",
      rewrite: "",
      jsons: [],
    };
    let config = load(readFileSync(join(path, "config.yaml"), "utf-8")) as rewritedFile;

    if (Array.isArray(config) || "object" !== typeof config) throw new Error(`"config.yaml"  is not in the expected format: ${path}`);

    rewritedFiles.push({
      ...defaultConfig,
      ...config,
    });
  }

  for (const iterator of rewritedFiles) {
    let filePath = iterator.filePath;

    if (!filePath.startsWith("/") && filePath.search(/^[a-zA-Z]:/) === -1) {
      filePath = join(workspace.uri.fsPath, filePath);
    }

    const config: Record<any, any> = {
      ...templateInnerVars,
    };
    if (undefined !== iterator.jsons) {
      for (const json of iterator.jsons) {
        let jsonPath = json.path;
        if (!jsonPath.startsWith("/") && jsonPath.search(/^[a-zA-Z]:/) === -1) {
          jsonPath = join(workspace.uri.fsPath, jsonPath);
        }
        config[json.name] = JSON.parse(readFileSync(jsonPath).toString());
      }
    }

    let content = compile(iterator.rewrite)(config);

    await outputFile(filePath, content);
  }
};
