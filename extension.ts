import { workspace, commands, FileType } from 'vscode';
import { dirname } from 'path';
import { openInWindows, openInPowershell } from './openInWindows'
import { openInMac, openInITerm } from './openInMac'
import { openInLinux, openInBash } from './openInLinux'

import type { ExtensionContext, Uri } from 'vscode';

const openTerminal = async (uri: Uri): Promise<void> => {
    const stats = await workspace.fs.stat(uri)
    let folderPath;
    if (stats.type == FileType.File) {
        folderPath = dirname(uri.fsPath)
    } else if (stats.type == FileType.Directory) {
        folderPath = uri.fsPath
    } else {
        // error
        return;
    }

    const extensionConfig = workspace.getConfiguration('opensystemshell');
    const useDefault = extensionConfig.get<boolean>('useDefault', true);
    const terminalIntegrated = workspace.getConfiguration('terminal.integrated');
    switch (process.platform) {
        case 'win32':
            if (useDefault) {
                await openInWindows(folderPath, terminalIntegrated.get<string>('defaultProfile.windows'));
            } else {
                await openInPowershell(folderPath);
            }
            break;
        case 'darwin':
            if (useDefault) {
                openInMac(folderPath, terminalIntegrated.get<string>('defaultProfile.osx'));
            } else {
                openInITerm(folderPath);
            }
            break;
        case 'linux':
            if (useDefault) {
                openInLinux(folderPath, terminalIntegrated.get<string>('defaultProfile.linux'));
            } else {
                openInBash(folderPath);
            }


    }
}


const openWorkspaceFolder = (): void => {
    if (workspace.workspaceFolders == null || workspace.workspaceFolders.length === 0) {
        return;
    }
    openTerminal(workspace.workspaceFolders[0].uri);
};

const folderCommandHandler = (uri?: Uri): void => {
    if (uri) {
        openTerminal(uri);
        return;
    }
    openWorkspaceFolder();
};

export const activate = (context: ExtensionContext): void => {
    context.subscriptions.push(
        commands.registerCommand(
            'opensystemshell.openFolderInTerminal',
            folderCommandHandler
        ),
        commands.registerCommand(
            'opensystemshell.openCurrentInTerminal',
            openWorkspaceFolder
        ));
};
