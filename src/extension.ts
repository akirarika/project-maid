import * as vscode from "vscode";
import { createTemplateCommand } from "./commands/createTemplateCommand";
import { publishGitRepoCommand } from "./commands/publishGitRepoCommand";

export function activate(context: vscode.ExtensionContext) {
  let createTemplate = vscode.commands.registerCommand("project-maid.createTemplate", createTemplateCommand);

  let publishGit = vscode.commands.registerCommand("project-maid.publishGitRepo", publishGitRepoCommand);

  context.subscriptions.push(createTemplate);
  context.subscriptions.push(publishGit);
}

export function deactivate() {}
