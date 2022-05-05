import { exec } from "child_process";
import { readFileSync, readdirSync, statSync, accessSync, constants } from "fs";
import { workspace, window, Uri } from "vscode";
import { join, resolve } from "path";
import { readdir, stat } from "fs-extra";

/**
 * 获取工作区 (项目根目录)
 * 若传入 uri 参数，即获取此 uri 所在的工作区
 * 若留空：
 *    若只有一个工作区，返回该工作区路径
 *    若有多个工作区，由用户选择
 */
export const getWorkspace = async (uri?: string) => {
  if (void 0 === workspace.workspaceFolders) {
    return;
  }
  if (undefined === uri) {
    if (1 === workspace.workspaceFolders?.length) {
      return workspace.workspaceFolders[0];
    }
    const selected = await window.showQuickPick(workspace.workspaceFolders.map((item) => item.name));
    return workspace.workspaceFolders.find((item) => item.name === selected);
  } else {
    let currentWorkspaceFolder;
    for (const workspaceFolder of workspace.workspaceFolders) {
      if (uri.startsWith(workspaceFolder.uri.fsPath)) {
        currentWorkspaceFolder = workspaceFolder;
        break;
      }
    }
    return currentWorkspaceFolder;
  }
};

/**
 * 读取文件内容，并转成数组 (按行)
 * @param path
 * @returns
 */
export const readFileContentToArray = (path: string) => {
  return readFileSync(path).toString().replace(/\r\n/g, "\r").replace(/\n/g, "\r").split(/\r/);
};

/**
 * 读取此目录下的文件
 * @param parentPath
 * @returns
 */
export const readChildFiles = (parentPath: string) => {
  let files = readdirSync(parentPath);
  let filesPath: string[] = [];

  files.forEach((item) => {
    let tempPath = join(parentPath, item);
    let stats = statSync(tempPath);
    if (!stats.isDirectory()) {
      filesPath.push(item);
    }
  });
  return filesPath;
};

/**
 * 读取此目录下的文件夹
 * @param parentPath
 * @returns
 */
export const readChildFolders = (parentPath: string) => {
  let files = readdirSync(parentPath);
  let filesPath: string[] = [];

  files.forEach((item) => {
    let tempPath = join(parentPath, item);
    let stats = statSync(tempPath);

    if (stats.isDirectory()) {
      filesPath.push(item);
    }
  });
  return filesPath;
};
