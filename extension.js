const vscode = require('vscode');
const { exec } = require('child_process');
const { dirname, } = require('path');
const { statSync, existsSync } = require('fs');

let openFolderCommand;
let openCurrentCommand;

function openInWindows(folderPath) {
    const checkPowerShell = 'powershell.exe -Command "exit"';
    exec(checkPowerShell, (error) => {
        if (!error) {
            // PowerShell is installed, use it
            const command = `start powershell.exe -NoExit -Command "Set-Location -LiteralPath '${folderPath.replace(/'/g, "''")}';"`;
            exec(command);
        } else {
            // PowerShell not found, fall back to Command Prompt
            const command = `start cmd.exe /k "cd /d "${folderPath}""`;
            exec(command);
        }
    });
}

function openInMac(folderPath) {
    // For macOS - first check for iTerm2
    const checkiTerm2 = 'osascript -e \'tell application "iTerm" to version\'';
    const openDefault = () => {
        const command = `open -a Terminal "${folderPath}"`;
        exec(command, (error) => {
            if (error) {
                vscode.window.showErrorMessage(`Failed to open Terminal: ${error.message}`);
            }
        });
    }
    exec(checkiTerm2, (error) => {
        if (!error) {
            // iTerm2 is installed, use it
            const appleScript = `
tell application "iTerm"
activate
create window with default profile
tell current session of current window
write text "cd ${folderPath}"
end tell
end tell
`;
            exec(`osascript -e '${appleScript}'`, (error) => {
                if (error) {
                    const command = `open -a Terminal "${folderPath}"`;
                    exec(command, (error) => {
                        if (error) {
                            openDefault()
                        }
                    });
                }
            });
        } else {
            openDefault();
        }
    });
}

function openInLinux(folderPath) {
    const terminals = ['x-terminal-emulator', 'gnome-terminal', 'konsole', 'xterm'];
    let found = false;

    for (const terminal of terminals) {
        const command = `${terminal} --working-directory="${folderPath}"`;
        try {
            exec(command, (error) => {
                if (!error) {
                    found = true;
                }
            });
            if (found) break;
        } catch (e) {
            // Continue to the next terminal
        }
    }

    if (!found) {
        vscode.window.showErrorMessage('Could not detect a suitable terminal emulator');
    }
}

/**
 * Opens a terminal at the specified path
 * @param {string} folderPath - Path to open in terminal
 */
function openTerminalAtPath(folderPath) {
    // Make sure the path exists
    if (!existsSync(folderPath)) {
        vscode.window.showErrorMessage(`Path does not exist: ${folderPath}`);
        return;
    }

    // Get stats to determine if it's a file or directory
    const stats = statSync(folderPath);

    // If it's a file, get the directory
    if (stats.isFile()) {
        folderPath = dirname(folderPath);
    }
    switch (process.platform) {
        case 'win32':
            openInWindows(folderPath);
            break;
        case 'darwin':
            openInMac(folderPath);
            break;
        default:
            openInLinux(folderPath);
            break;
    }
}

function openWorkspaceFolder() {
    // For keyboard shortcut, directly open workspace root folder
    if (vscode.workspace.workspaceFolders == null || vscode.workspace.workspaceFolders.length == 0) return;
    openTerminalAtPath(vscode.workspace.workspaceFolders[0].uri.fsPath);

}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Extension "opensystemshell" is now active');
    // Command to open a folder in terminal from the context menu
    openFolderCommand = vscode.commands.registerCommand('opensystemshell.openFolderInTerminal', (uri) => {
        if (uri) {
            openTerminalAtPath(uri.fsPath);
            return;
        }
        openWorkspaceFolder();
    });

    // Command to open current location (keyboard shortcut)
    openCurrentCommand = vscode.commands.registerCommand('opensystemshell.openCurrentInTerminal', openWorkspaceFolder);

    context.subscriptions.push(openFolderCommand);
    context.subscriptions.push(openCurrentCommand);
}

function deactivate() {
    if (openFolderCommand) {
        openFolderCommand.dispose();
    }
    if (openCurrentCommand) {
        openCurrentCommand.dispose();
    }
}

module.exports = {
    activate,
    deactivate
}; 