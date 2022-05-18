import * as vscode from "vscode";
import { createTemplateCommand } from "./commands/createTemplateCommand";
import { gitRepoCommand } from "./commands/gitRepoCommand";

export function activate(context: vscode.ExtensionContext) {
  let createTemplate = vscode.commands.registerCommand("project-maid.createTemplate", createTemplateCommand);

  let publishGit = vscode.commands.registerCommand("project-maid.git", gitRepoCommand);

  context.subscriptions.push(createTemplate);
  context.subscriptions.push(publishGit);
}

export function deactivate() {}
