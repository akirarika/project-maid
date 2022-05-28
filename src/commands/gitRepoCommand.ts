import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs-extra";
import { join } from "path";
import { Uri, window } from "vscode";
import { execShellScript, getWorkspace, makeShellScriptIgnoreError } from "../helpers";
import { load } from "js-yaml";
import { compile } from "handlebars";
import { userInfo } from "os";

interface Config {
  branches: Array<string> | undefined;
  scopes: Array<string>;
  subject: string;
  message: string;
  prehooks: string;
}

export const gitRepoCommand = async (uri: Uri) => {
  const date = new Date();

  const action = await window.showQuickPick(["commit & push..", "pull..", "switch branch..", "merge branch.."], {
    placeHolder: "Push to branch..",
  });
  const workspace = await getWorkspace();
  if (!workspace) {
    return await window.showErrorMessage("Workspace not found.");
  }
  if (!existsSync(join(workspace.uri.fsPath, ".pm"))) {
    return await window.showErrorMessage(
      `Project Maid configurations does not exist in the current project, please refer to the document and create ' PM 'folder and configure it.`
    );
  }
  if (!existsSync(join(workspace.uri.fsPath, ".pm", "git"))) {
    return await window.showErrorMessage(`There is not Project Maid git configured for this project. Please refer to the documentation.`);
  }

  const vars = {
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

  const extcOptions = {
    cwd: workspace.uri.fsPath,
  };

  try {
    execSync(`git --version`, extcOptions);
  } catch (error) {
    return await window.showErrorMessage("Git doesn't exist, you can visit https://git-scm.com/ to install it.");
  }

  try {
    const origins = execSync("git remote --verbose", extcOptions).toString().split(/\r?\n/);
    if (1 >= origins.length) {
      throw new Error("No remote repository");
    }
  } catch (error) {
    return await window.showErrorMessage(
      "Git does not exist in the current workspace or is not associated with a remote repository. Path: " + workspace.uri.fsPath
    );
  }

  let config: Config;
  try {
    config = load(readFileSync(join(workspace.uri.fsPath, ".pm", "git", "config.yaml"), "utf-8")) as Config;
  } catch (error) {
    return await window.showErrorMessage(
      "The config.yaml does not exist or the content is not valid. Path: " + join(workspace.uri.fsPath, ".pm", "git", "config.yaml")
    );
  }

  let defaultConfig = {
    branches: undefined,
    scopes: ["✨ feat", "🔧 fix", "📝 docs", "🎨 style", "⚡️ perf", "✅ test", "🐳 chore", "🚀 build", "🔨 refactor", "🎉 init"],
    subject: "",
    message: "{{scope}}: {{subject}}",
    prehooks: "",
  };
  config = {
    ...defaultConfig,
    ...config,
  };

  if (undefined === config.branches || 0 === config.branches.length) {
    return await window.showErrorMessage("The 'branches' field must be filled in config.yaml, including your main branches (such as master)");
  }

  if ("commit & push.." === action) {
    const branch = await window.showQuickPick(["<cancel>", ...config.branches], {
      placeHolder: "Push to branch..",
    });
    if (!branch || "<cancel>" === branch) return;

    const scope = await window.showQuickPick(["<cancel>", ...config.scopes], {
      placeHolder: "Use commit message scope..",
    });
    if (!scope || "<cancel>" === scope) return;

    const subject = await window.showInputBox({
      value: config.subject,
      placeHolder: "Enter commit message..",
    });
    if (!subject) return;

    const commands: Array<string> = [];
    commands.push(`cd ${workspace.uri.fsPath}`);

    if (config.prehooks) {
      commands.push(
        compile(config.prehooks)({
          scope: scope,
          branch: branch,
          subject: subject,
          ...vars,
        })
      );
    }

    const message = compile(config.message)({
      scope: scope,
      branch: branch,
      subject: subject,
      ...vars,
    });

    const currentBranch = execSync("git symbolic-ref --short HEAD", extcOptions)
      .toString()
      .replace(/(^\s*)|(\s*$)/g, "");

    // Prevent problems caused by git ignoring case
    commands.push("git config core.ignorecase false");
    commands.push("git add --all");
    commands.push(`git commit --message "${message}"`);
    commands.push(`git push -u origin "${currentBranch}"`);

    if (currentBranch !== branch) {
      commands.push(makeShellScriptIgnoreError(`git switch --create "${branch}"`));
      commands.push(`git switch "${branch}"`);
      commands.push(`git merge "${currentBranch}"`);
      commands.push(`git push -u origin "${branch}"`);
      commands.push(`git switch "${currentBranch}"`);
    }

    execShellScript(commands);

    return;
  }

  if ("pull.." === action) {
    const commands: Array<string> = [];

    commands.push(`cd ${workspace.uri.fsPath}`);
    commands.push(`git fetch`);
    commands.push(`git merge FETCH_HEAD`);

    execShellScript(commands);
  }

  if ("switch branch.." === action) {
    const commands: Array<string> = [];

    const branch = await window.showQuickPick(["<cancel>", ...config.branches], {
      placeHolder: "Push to branch..",
    });
    if (!branch || "<cancel>" === branch) return;

    commands.push(`cd ${workspace.uri.fsPath}`);
    commands.push(makeShellScriptIgnoreError(`git switch --create "${branch}"`));
    commands.push(`git switch "${branch}"`);

    execShellScript(commands);
  }

  if ("merge branch.." === action) {
    const fromBranch = await window.showQuickPick(["<cancel>", ...config.branches], {
      placeHolder: "Source branch..",
    });
    if (!fromBranch || "<cancel>" === fromBranch) return;

    const toBranch = await window.showQuickPick(["<cancel>", ...config.branches], {
      placeHolder: "Target branch..",
    });
    if (!toBranch || "<cancel>" === toBranch) return;
    if (fromBranch === toBranch) return;

    const currentBranch = execSync("git symbolic-ref --short HEAD", extcOptions)
      .toString()
      .replace(/(^\s*)|(\s*$)/g, "");

    const commands: Array<string> = [];
    commands.push(`cd ${workspace.uri.fsPath}`);

    commands.push(makeShellScriptIgnoreError(`git switch --create "${toBranch}"`));
    commands.push(`git switch "${toBranch}"`);
    commands.push(`git merge "${fromBranch}"`);
    commands.push(`git push -u origin "${toBranch}"`);
    commands.push(`git switch "${currentBranch}"`);

    execShellScript(commands);
  }
};
