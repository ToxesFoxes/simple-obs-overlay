# simple-obs-overlay

An Electron application with React and TypeScript designed for basic OBS Studio control through an overlay.

## Features

- **OBS Integration**: Connect to OBS Studio via WebSocket protocol
- **Basic OBS Controls**: Manage core OBS functionality through a simple overlay
- **Status Monitoring**: Monitor OBS stream and recording status
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Modern UI**: Built with React and Ant Design

## Technologies

- **Electron**: Cross-platform desktop app framework
- **React**: UI library for building interfaces
- **TypeScript**: Type-safe JavaScript
- **Redux Toolkit**: State management
- **OBS WebSocket**: Communication with OBS Studio
- **Ant Design**: UI component library
- **Styled Components**: CSS-in-JS styling

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [OBS Studio](https://obsproject.com/) with WebSocket plugin enabled

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Type Check

```bash
$ npm run typecheck
```

### Linting & Formatting

```bash
$ npm run lint
$ npm run format
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Configuration

The app requires a connection to OBS WebSocket. You can configure the connection settings in the app's settings panel:

- Host: The IP address of your OBS instance (default: 127.0.0.1)
- Port: The WebSocket port (default: 4455)
- Password: Your OBS WebSocket password (if configured)

## Main Functionality

- Connect to your OBS instance via WebSocket
- View and control basic OBS settings
- Monitor stream and recording status
- Quick access to essential OBS controls without switching to the main OBS window

## Project Structure

- `/src/main` - Electron main process code
- `/src/renderer` - React application (renderer process)
- `/src/preload` - Preload scripts for secure IPC communication
- `/resources` - Application resources

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
