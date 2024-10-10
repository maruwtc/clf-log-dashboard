# CLF Log Analyzer

![Capture](https://github.com/maruwtc/clf-log-dashboard/blob/master/src/public/pic1.jpeg?raw=true)

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

