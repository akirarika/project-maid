import { existsSync, readFileSync, renameSync, statSync, writeFileSync } from "fs";
import { basename, dirname, join } from "path";
import { Uri, window } from "vscode";
import { getWorkspace, readChildFiles, readChildFolders } from "../helpers";
import { copySync } from "fs-extra";
import { camel, hump, hyphen, underline } from "@poech/camel-hump-under";
import { compile } from "handlebars";
import { readDirDeepSync } from "read-dir-deep";
import { userInfo } from "os";

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
    placeHolder: "use template..",
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

  if (templateFolders.length > 1) {
    return await window.showErrorMessage(
      `The root of a template can only exist in one folder or one .tpl file. currently, it has ${templateFolders.length} folders.`
    );
  }

  if (templateFolders.length === 0) {
    const templateFiles = readChildFiles(tempatePath).filter((file) => file.endsWith(".tpl"));
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

  window.showInformationMessage("Created folder successfully.");
  return;
};
