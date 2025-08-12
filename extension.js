"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = require("vscode");
const path_1 = require("path");
const openInWindows_1 = require("./openInWindows");
const openInMac_1 = require("./openInMac");
const openInLinux_1 = require("./openInLinux");
const openTerminal = async (uri) => {
    const stats = await vscode_1.workspace.fs.stat(uri);
    let folderPath;
    if (stats.type == vscode_1.FileType.File) {
        folderPath = (0, path_1.dirname)(uri.fsPath);
    }
    else if (stats.type == vscode_1.FileType.Directory) {
        folderPath = uri.fsPath;
    }
    else {
        // error
        return;
    }
    const extensionConfig = vscode_1.workspace.getConfiguration('opensystemshell');
    const useDefault = extensionConfig.get('useDefault', true);
    switch (process.platform) {
        case 'win32':
            if (useDefault) {
                (0, openInWindows_1.openInWindows)(folderPath);
            }
            else {
                (0, openInWindows_1.openInPowershell)(folderPath);
            }
            break;
        case 'darwin':
            if (useDefault) {
                (0, openInMac_1.openInMac)(folderPath);
            }
            else {
                (0, openInMac_1.openInITerm)(folderPath);
            }
            break;
        // case 'linux':
        default:
            if (useDefault) {
                (0, openInLinux_1.openInLinux)(folderPath);
            }
            else {
                (0, openInLinux_1.openInBash)(folderPath);
            }
    }
};
const openWorkspaceFolder = () => {
    if (vscode_1.workspace.workspaceFolders == null || vscode_1.workspace.workspaceFolders.length === 0) {
        return;
    }
    openTerminal(vscode_1.workspace.workspaceFolders[0].uri);
};
const folderCommandHandler = (uri) => {
    if (uri) {
        openTerminal(uri);
        return;
    }
    openWorkspaceFolder();
};
const activate = (context) => {
    context.subscriptions.push(vscode_1.commands.registerCommand('opensystemshell.openFolderInTerminal', folderCommandHandler), vscode_1.commands.registerCommand('opensystemshell.openCurrentInTerminal', openWorkspaceFolder));
};
exports.activate = activate;
