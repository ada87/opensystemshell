import { exec } from 'child_process';


var powershellIsInstalled: boolean | null = null;
var pwshIsInstalled: boolean | null = null;

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

const checkPwsh = async (): Promise<boolean> => new Promise<boolean>(r => {
    if (typeof pwshIsInstalled === 'boolean') {
        r(pwshIsInstalled)
        return
    }

    exec('pwsh.exe -Command "exit"', err => {
        pwshIsInstalled = err == null;
        r(pwshIsInstalled);
    })
})

const openInCmd = (folderPath: string): void => {
    exec(`start cmd.exe /k "cd /d "${folderPath}""`);
};

const openInPwsh = async (folderPath: string): Promise<void> => {
    const installed = await checkPwsh();
    if (installed) {
        exec(`start pwsh.exe -NoExit -Command "Set-Location -LiteralPath '${folderPath.replace(/'/g, "''")}';"`);
    } else {
        openInPowershell(folderPath)
    }
};

export const openInPowershell = async (folderPath: string): Promise<void> => {
    const installed = await checkPowerShell();
    if (installed) {
        exec(`start powershell.exe -NoExit -Command "Set-Location -LiteralPath '${folderPath.replace(/'/g, "''")}';"`);
    } else {
        openInCmd(folderPath)
    }
};

export const openInWindows = async (folderPath: string, defaultProfile?: string): Promise<void> => {
    if (defaultProfile != null) {
        const profileLower = defaultProfile.toLowerCase();
        if (profileLower.startsWith('command') || profileLower.includes('cmd')) {
            openInCmd(folderPath);
            return;
        }
    }

    // 尝试 pwsh 7
    const hasPwsh = await checkPwsh();
    if (hasPwsh) {
        openInPwsh(folderPath);
        return;
    }

    // 尝试普通 PowerShell
    const hasPowershell = await checkPowerShell();
    if (hasPowershell) {
        openInPowershell(folderPath);
        return;
    }
    openInCmd(folderPath);
};