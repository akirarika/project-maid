import { existsSync, readFileSync, renameSync, statSync, writeFileSync } from "fs";
import { basename, dirname, join } from "path";
import { Uri, window } from "vscode";
import { execShellScript, getWorkspace, readChildFiles, readChildFolders } from "../helpers";
import { copySync } from "fs-extra";
import { camel, hump, hyphen, underline } from "@poech/camel-hump-under";
import { compile } from "handlebars";
import { readDirDeepSync } from "read-dir-deep";
import { load } from "js-yaml";
import { userInfo } from "os";

interface appendConfig {
  filePath: string;
  appendPath?: Array<string>;
  append: string;
  space?: number;
}

type createdHook = string;

interface Config {
  createdHooks?: Array<createdHook>;
  appendConfigs?: Array<appendConfig>;
}

export const createTemplateCommand = async (uri: Uri) => {
  const selectedPath = uri.fsPath;
  const workspace = await getWorkspace(uri.fsPath);
  if (!workspace) {
    return await window.showErrorMessage("Workspace not found.");
  }
  if (!existsSync(join(workspace.uri.fsPath, ".pm"))) {
    return await window.showErrorMessage(
      `Project Maid configurations does not exist in the current project, please refer to the document and create ' PM 'folder and configure it.`
    );
  }
  if (!existsSync(join(workspace.uri.fsPath, ".pm", "templates"))) {
    return await window.showErrorMessage(`There is not Project Maid template configured for this project. Please refer to the documentation.`);
  }

  const instantiateName = await window.showInputBox({
    value: "",
    placeHolder: "Input name..",
  });
  if (!instantiateName) {
    return;
  }

  const templateNames = readChildFolders(join(workspace.uri.fsPath, ".pm", "templates"));
  const templateName = await window.showQuickPick(["<cancel>", ...templateNames], {
    placeHolder: "Use template..",
  });
  if (!templateName || templateName === "<cancel>") {
    return;
  }

  const date = new Date();

  const templateInnerVars = {
    yourNameRaw: instantiateName,
    yourName: camel(instantiateName),
    YourName: hump(instantiateName),
    your_name: underline(instantiateName).replace(/^\_|\_+$/gm, ""),
    "your-name": hyphen(instantiateName).replace(/^\-+|\-+$/gm, ""),
    templateNameRaw: templateName,
    templateName: camel(templateName),
    TemplateName: hump(templateName),
    template_name: underline(templateName).replace(/^\_|\_+$/gm, ""),
    "template-name": hyphen(templateName).replace(/^\-+|\-+$/gm, ""),
    path: workspace.uri.fsPath,
    yyyy: `${date.getFullYear()}`.padStart(4, "0"),
    mm: `${date.getMonth() + 1}`.padStart(2, "0"),
    dd: `${date.getDate()}`.padStart(2, "0"),
    h: `${date.getHours()}`.padStart(2, "0"),
    m: `${date.getMinutes()}`.padStart(2, "0"),
    s: `${date.getSeconds()}`.padStart(2, "0"),
    timestamp: parseInt(`${date.getTime() / 1000}`),
    timestampMs: date.getTime(),
    username: userInfo().username,
  };

  const tempatePath = join(workspace.uri.fsPath, ".pm", "templates", templateName);
  const templateFolders = readChildFolders(tempatePath);

  let templateConfig: Config | undefined;
  try {
    templateConfig = load(readFileSync(join(tempatePath, "config.yaml"), "utf-8")) as Config;
    let defaultConfig = {
      appendConfigs: [],
      createdHooks: [],
    };
    templateConfig = {
      ...defaultConfig,
      ...templateConfig,
    };
  } catch (error) {
    return await window.showErrorMessage(
      "Created folder successfully, but there may be errors in other operations. Please check your config: \n" + error
    );
  }

  const handleFinish = async () => {
    try {
      if (undefined !== templateConfig) {
        if (undefined !== templateConfig.appendConfigs) {
          for (const iterator of templateConfig.appendConfigs) {
            let filePath = iterator.filePath;
            if (!filePath.startsWith("/") && filePath.search(/^[a-zA-Z]:/) === -1) {
              filePath = join(workspace.uri.fsPath, filePath);
            }
            let json = JSON.parse(readFileSync(filePath).toString());
            if ("object" !== typeof json) throw new Error("This JSON file is empty or unqualified: " + filePath);
            let pendingJson: Array<any> = json;
            if (!Array.isArray(pendingJson)) throw new Error("You can only append to the end of the array. " + filePath);
            if (Array.isArray(iterator.appendPath)) {
              for (const key in iterator.appendPath) {
                pendingJson = pendingJson[key];
              }
            }
            let append = iterator.append;
            append = compile(`${append}`)(templateInnerVars);
            pendingJson.push(JSON.parse(append));
            writeFileSync(filePath, JSON.stringify(json, null, iterator.space ?? 2));
          }
        }

        if (undefined !== templateConfig.createdHooks && 0 !== templateConfig.createdHooks.length) {
          const commands: Array<string> = [];
          commands.push(`cd ${workspace.uri.fsPath}`);
          for (const iterator of templateConfig.createdHooks) {
            commands.push(compile(`${iterator}`)(templateInnerVars));
          }
          execShellScript(commands);
        }
      }
    } catch (error) {
      return await window.showErrorMessage(
        "Created folder successfully, but there may be errors in other operations. Please check your config: \n" + error
      );
    }
  };

  if (templateFolders.length > 1) {
    return await window.showErrorMessage(
      `The root of a template can only exist in one folder or one .tpl file. currently, it has ${templateFolders.length} folders.`
    );
  }

  if (templateFolders.length === 0) {
    let templateFiles = readChildFiles(tempatePath).filter((file) => file.endsWith(".tpl"));
    if (templateFiles.length > 1 || templateFiles.length === 0) {
      return await window.showErrorMessage(
        `The root of a template can only exist in one folder or one .tpl file. currently, it has ${templateFolders.length} .tpl files.`
      );
    }
    const tempateFileName = templateFiles[0];
    const tempateFileNameF = compile(`${tempateFileName}`)(templateInnerVars).slice(0, -4);
    const createdFilePath = join(selectedPath, tempateFileNameF);

    if (existsSync(createdFilePath)) {
      return await window.showErrorMessage(`File already exists. (${tempateFileNameF})`);
    }

    await copySync(join(workspace.uri.fsPath, ".pm", "templates", templateName, tempateFileName), createdFilePath);
    const createdFile = createdFilePath;

    const raw = readFileSync(createdFile).toString();
    const result = compile(raw)(templateInnerVars);
    writeFileSync(createdFile, result);

    await handleFinish();

    window.showInformationMessage("Created file successfully.");
    return;
  }

  const tempateFolderName = templateFolders[0];

  const tempateFolderNameF = compile(`${tempateFolderName}`)(templateInnerVars);
  const createdFolderPath = join(selectedPath, tempateFolderNameF);

  if (existsSync(createdFolderPath)) {
    return await window.showErrorMessage(`File already exists. (${tempateFolderNameF})`);
  }

  await copySync(join(workspace.uri.fsPath, ".pm", "templates", templateName, tempateFolderName), createdFolderPath);
  const createdFiles = await readDirDeepSync(createdFolderPath);
  for (const createdFile of createdFiles) {
    if (!createdFile.endsWith(".tpl")) {
      continue;
    }
    const raw = readFileSync(createdFile).toString();
    const result = compile(raw)(templateInnerVars);
    writeFileSync(createdFile, result);
  }
  for (const createdFile of createdFiles) {
    if (!createdFile.endsWith(".tpl")) {
      continue;
    }
    const filePath = dirname(createdFile);
    const fileName = basename(createdFile);
    renameSync(createdFile, join(filePath, compile(`${fileName}`)(templateInnerVars)).slice(0, -4));
  }
  let createdFolders = createdFiles.map((file) => dirname(file));
  createdFolders = createdFolders.filter((item, index) => createdFolders.indexOf(item) === index);
  for (const createdFolder of createdFolders) {
    const folderPath = dirname(createdFolder);
    const folderName = basename(createdFolder);
    renameSync(createdFolder, join(folderPath, compile(`${folderName}`)(templateInnerVars)));
  }

  await handleFinish();

  window.showInformationMessage("Created folder successfully.");
  return;
};
