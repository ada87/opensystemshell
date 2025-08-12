import { workspace } from 'vscode';
import { exec } from 'child_process';


var powershellIsInstalled: boolean | null = null;

const checkPowerShell = async (): Promise<boolean> => new Promise<boolean>(r => {
    if (typeof powershellIsInstalled === 'boolean') {
        r(powershellIsInstalled)
        return
    }

    exec('powershell.exe -Command "exit"', err => {
        powershellIsInstalled = err == null;
        r(powershellIsInstalled);
    })
})

const openInCmd = (folderPath: string): void => {
    exec(`start cmd.exe /k "cd /d "${folderPath}""`);
};

export const openInPowershell = async (folderPath: string): Promise<void> => {
    const installed = await checkPowerShell();
    if (installed) {
        exec(`start powershell.exe -NoExit -Command "Set-Location -LiteralPath '${folderPath.replace(/'/g, "''")}';"`);
    } else {
        openInCmd(folderPath)
    }
};

export const openInWindows = (folderPath: string): void => {

    const terminalIntegrated = workspace.getConfiguration('terminal.integrated');
    const defaultProfile = terminalIntegrated.get<string>('defaultProfile.windows');

    if (defaultProfile == null) {
        openInPowershell(folderPath)
        return;
    }
    if (defaultProfile.toLowerCase().startsWith('command')) {
        openInCmd(folderPath)
        return;
    }
    openInPowershell(folderPath);
};