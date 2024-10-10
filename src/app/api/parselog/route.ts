import { promises as fs } from 'fs';
import { config } from '@/lib/config';
import { NextResponse } from 'next/server';

export const GET = async () => {
    try {
        console.log('Attempting to read log file from:', config.logPath);
        const logContent = await fs.readFile(config.logPath, 'utf-8');
        const logLines = logContent.split('\n');
        console.log('Successfully read log file. Number of lines:', logLines.length);
        console.log('First log line:', logLines[0]);
        return NextResponse.json({ logLines });
    } catch (error) {
        console.error('Error reading log file:', error);
        if (error instanceof Error) {
            return NextResponse.json(
                { error: 'Error reading log file', details: error.message },
                { status: 500 }
            );
        } else {
            return NextResponse.json(
                { error: 'Error reading log file', details: 'Unknown error' },
                { status: 500 }
            );
        }
    };
}; ``