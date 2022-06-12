import * as vscode from "vscode";
import { createTemplateCommand } from "./commands/createTemplateCommand";
import { executeCreatorsCommand } from "./commands/executeCreatorsCommand";
import { gitRepoCommand } from "./commands/gitRepoCommand";

export function activate(context: vscode.ExtensionContext) {
  let createTemplate = vscode.commands.registerCommand("project-maid.createTemplate", createTemplateCommand);
  let executeCreators = vscode.commands.registerCommand("project-maid.executeCreators", executeCreatorsCommand);
  let executeHooks = vscode.commands.registerCommand("project-maid.executeHooks", executeCreatorsCommand);
  let publishGit = vscode.commands.registerCommand("project-maid.git", gitRepoCommand);

  context.subscriptions.push(createTemplate);
  context.subscriptions.push(executeCreators);
  context.subscriptions.push(executeHooks);
  context.subscriptions.push(publishGit);
}

export function deactivate() {}
