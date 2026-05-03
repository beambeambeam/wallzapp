# Desktop Build Notes

## Windows `.exe` build

Build the Windows installer on a native Windows x64 machine or VM. Electrobun only packages for the current host platform, so this cannot be produced from macOS.

### Prerequisites

- Bun installed
- A local checkout of this repository
- Standard PowerShell archive support (`Expand-Archive`)

### Commands

Run these from the repository root:

```bash
bun install
cd apps/desktop
bun run dist:win:exe
```

### Expected outputs

After a successful Windows build, the desktop app writes:

- `apps/desktop/artifacts/stable-win-x64-wallzapp-Setup.zip`
- `apps/desktop/artifacts/wallzapp-windows-x64-setup.exe`

### Notes

- The `.exe` is unsigned in this flow, so Windows SmartScreen warnings are expected.
- This pass does not configure release hosting, code signing, or auto-update publishing.
