//  tsx .\openInWindow.test.ts 
import { test } from 'node:test'
import { openInWindows } from './openInWindows';
import { homedir } from 'os'
import { join } from 'path';

test('sample test', async () => {
    await openInWindows(join(homedir(), 'Documents'), 'Command Prompt');

    await openInWindows(join(homedir(), 'Documents'), 'PowerShell');

    await openInWindows(join(homedir(), 'Documents'));
})