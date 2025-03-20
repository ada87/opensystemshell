const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Opens a terminal at the specified path
 * @param {string} folderPath - Path to open in terminal
 */
function openTerminalAtPath(folderPath) {
    // Make sure the path exists
    if (!fs.existsSync(folderPath)) {
        vscode.window.showErrorMessage(`Path does not exist: ${folderPath}`);
        return;
    }

    // Get stats to determine if it's a file or directory
    const stats = fs.statSync(folderPath);
    
    // If it's a file, get the directory
    if (stats.isFile()) {
        folderPath = path.dirname(folderPath);
    }

    // Ensure path exists and is a directory
    if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
        vscode.window.showErrorMessage(`Invalid directory: ${folderPath}`);
        return;
    }

    try {
        if (process.platform === 'win32') {
            // For Windows (PowerShell)
            const command = `start powershell.exe -NoExit -Command "Set-Location -LiteralPath '${folderPath.replace(/'/g, "''")}';"`;
            exec(command, (error) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to open terminal: ${error.message}`);
                }
            });
        } else if (process.platform === 'darwin') {
            // For macOS
            const command = `open -a Terminal "${folderPath}"`;
            exec(command, (error) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to open terminal: ${error.message}`);
                }
            });
        } else {
            // For Linux - try to detect the terminal
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
    } catch (error) {
        vscode.window.showErrorMessage(`Error opening terminal: ${error.message}`);
    }
}

/**
 * Gets the selected item in the explorer view
 * @returns {vscode.Uri | null} The URI of the selected item or null if nothing is selected
 */
async function getExplorerSelection() {
    try {
        // Try to get the selected file in the explorer
        const selectionFromExplorer = await vscode.commands.executeCommand('copyFilePath');
        if (selectionFromExplorer && typeof selectionFromExplorer === 'string') {
            return vscode.Uri.file(selectionFromExplorer);
        }
    } catch (e) {
        // If copyFilePath fails, continue with other methods
    }
    return null;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Extension "opensystemshell" is now active');

    // Command to open a folder in terminal from the context menu
    let openFolderCmd = vscode.commands.registerCommand('opensystemshell.openFolderInTerminal', (uri) => {
        if (!uri) {
            // If no URI is provided, use the currently opened folder
            if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                uri = vscode.workspace.workspaceFolders[0].uri;
            } else {
                vscode.window.showErrorMessage('No folder is open in the workspace');
                return;
            }
        }

        openTerminalAtPath(uri.fsPath);
    });

    // Command to open current location (keyboard shortcut)
    let openCurrentCmd = vscode.commands.registerCommand('opensystemshell.openCurrentInTerminal', async () => {
        // First check if there's a selection in the explorer view
        const explorerSelection = await getExplorerSelection();
        
        if (explorerSelection) {
            // If there's a selection in the explorer, use that
            openTerminalAtPath(explorerSelection.fsPath);
        } 
        // Check if there's an active editor
        else if (vscode.window.activeTextEditor) {
            // Get the path of the active document
            const filePath = vscode.window.activeTextEditor.document.uri.fsPath;
            openTerminalAtPath(filePath);
        } 
        // Otherwise use workspace root folder
        else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
            openTerminalAtPath(rootPath);
        } 
        else {
            vscode.window.showErrorMessage('No folder is open in the workspace');
        }
    });

    context.subscriptions.push(openFolderCmd);
    context.subscriptions.push(openCurrentCmd);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}; 