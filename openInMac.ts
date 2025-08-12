import { workspace } from 'vscode';
import { exec } from 'child_process';

var iTermIsInstalled: boolean | null = null;

const checkITerm = async (): Promise<boolean> => new Promise<boolean>(r => {
    if (typeof iTermIsInstalled === 'boolean') {
        r(iTermIsInstalled);
        return;
    }

    exec('osascript -e \'tell application "iTerm" to version\'', err => {
        iTermIsInstalled = err == null;
        r(iTermIsInstalled);
    });
});

const openInTerminal = (folderPath: string): void => {
    const appleScript = `
tell application "Terminal"
activate
do script "cd '${folderPath.replace(/'/g, "'\\''")}'"
end tell
`;
    exec(`osascript -e '${appleScript}'`);
};

export const openInITerm = async (folderPath: string): Promise<void> => {
    const installed = await checkITerm();
    if (installed) {
        const appleScript = `
tell application "iTerm"
activate
create window with default profile
tell current session of current window
write text "cd '${folderPath.replace(/'/g, "'\\''")}'"
end tell
end tell
`;
        exec(`osascript -e '${appleScript}'`);
    } else {
        openInTerminal(folderPath);
    }
};

export const openInMac = (folderPath: string): void => {
    const terminalIntegrated = workspace.getConfiguration('terminal.integrated');
    const defaultProfile = terminalIntegrated.get<string>('defaultProfile.osx');

    if (defaultProfile == null) {
        openInITerm(folderPath);
        return;
    }
    
    if (defaultProfile.toLowerCase().includes('terminal')) {
        openInTerminal(folderPath);
        return;
    }
    
    openInITerm(folderPath);
};