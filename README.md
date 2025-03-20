# Open In System Shell

A Visual Studio Code extension that provides multiple ways to open folders in your system shell. This extension adds context menu options for files and folders, and keyboard shortcuts to quickly open the system terminal at your desired location.

## Features

- 📁 **Context Menu**: Right-click on any file or folder to open it in system shell
- ⌨️ **Keyboard Shortcut**: Use `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac) to open current location

## Usage

### Context Menu

Right-click on any file or folder in the Explorer and select "Open in System Shell":
- If you right-click on a folder, the terminal opens at that folder's location
- If you right-click on a file, the terminal opens at the file's parent folder

### Keyboard Shortcut

Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac) to open a terminal:
- If you have a file/folder selected in the Explorer, the terminal opens at that location (or parent folder for files)
- If you have an editor open but nothing selected in Explorer, the terminal opens at the current file's parent folder
- If no file is selected or open, the terminal opens at the workspace root folder

## Platform Support

- **Windows**: Opens PowerShell at the specified location
- **macOS**: Opens Terminal app at the specified location
- **Linux**: Attempts to detect and use the available terminal emulator

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (or press `Ctrl+Shift+X`)
3. Search for "Open In System Shell"
4. Click Install

### From VSIX File

1. Download the VSIX file
2. Open VS Code
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
4. Type "Install from VSIX" and select the command
5. Choose the downloaded VSIX file

## Customization

You can customize the keyboard shortcut by going to:
1. File > Preferences > Keyboard Shortcuts
2. Search for "Open Current Location in System Shell"
3. Click the pencil icon to edit the keybinding

## Issues and Contributions

Please report any issues or feature requests on the [GitHub repository](https://github.com/ada87/opensystemshell/issues).

## License

This extension is licensed under the [MIT License](LICENSE).
