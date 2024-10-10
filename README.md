# CLF Log Analyzer

![Homepage](https://raw.githubusercontent.com/maruwtc/clf-log-dashboard/main/src/public/pic1.png?raw=true)

## Features
CLF Log Analyzer is an open source real-time web log analyzer and interactive viewer, which allow user to do interaction with data.


## Usage
1. To start edit `config.ts` to locate the log file
```typescript
export const config = {
    logPath: '/var/log/apache2/access.log',
}
```
2. Start the application
```bash
bun install

# dev
bun dev

# prod
bun build
bun start
```

