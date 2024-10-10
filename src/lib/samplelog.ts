import { faker } from '@faker-js/faker';

// Fixed list of 10 IP addresses
const fixedIPs = [
    '192.168.1.100', '10.0.0.50', '172.16.0.1', '192.168.0.10', '10.10.10.10',
    '172.31.255.255', '192.168.1.1', '10.1.1.1', '172.20.20.20', '192.168.100.100'
];

// Fixed list of paths with their weights
const pathsWithWeights = [
    { path: '/index.html', weight: 100 },
    { path: '/products.html', weight: 80 },
    { path: '/about.html', weight: 50 },
    { path: '/login.html', weight: 30 },
    { path: '/contact.html', weight: 20 },
    { path: '/services.html', weight: 15 },
    { path: '/blog.html', weight: 10 },
    { path: '/faq.html', weight: 5 },
    { path: '/register.html', weight: 3 },
    { path: '/dashboard.html', weight: 1 }
];

const generateSampleLog = (date: Date, ip: string, path: string) => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const statuses = [200, 301, 304, 400, 401, 403, 404, 500];

    const method = faker.helpers.arrayElement(methods);
    const protocol = 'HTTP/1.0';
    const status = faker.helpers.arrayElement(statuses);
    const size = faker.number.int({ min: 100, max: 10000 });

    return `${ip} - - [${date.toISOString().split('T')[0]}:${date.toTimeString().split(' ')[0]} -0700] "${method} ${path} ${protocol}" ${status} ${size}`;
};

const weightedRandomSelect = (items: any[], weights: number[]) => {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let randomWeight = faker.number.int({ min: 1, max: totalWeight });
    for (let i = 0; i < weights.length; i++) {
        randomWeight -= weights[i];
        if (randomWeight <= 0) {
            return items[i];
        }
    }
    return items[items.length - 1]; // Fallback
};

const generateSampleLogs = (count: number) => {
    const logs = [];
    const startDate = new Date('2024-01-01T00:00:00');

    // IP weights (skewed distribution)
    const ipWeights = [100, 50, 25, 10, 5, 2, 1, 1, 1, 1];

    // Extract paths and weights
    const paths = pathsWithWeights.map(pw => pw.path);
    const pathWeights = pathsWithWeights.map(pw => pw.weight);

    for (let i = 0; i < count; i++) {
        const date = new Date(startDate.getTime() + i * 60000);
        const ip = weightedRandomSelect(fixedIPs, ipWeights);
        const path = weightedRandomSelect(paths, pathWeights);
        logs.push(generateSampleLog(date, ip, path));
    }

    return logs;
};

export const sampleLogs = generateSampleLogs(10000);

// Function to analyze distribution
const analyzeDistribution = (logs: string[], extractFn: (log: string) => string, label: string) => {
    const counts: { [key: string]: number } = {};
    logs.forEach(log => {
        const item = extractFn(log);
        counts[item] = (counts[item] || 0) + 1;
    });

    console.log(`${label} Distribution:`);
    Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([item, count]) => {
            console.log(`${item}: ${count} (${((count / logs.length) * 100).toFixed(2)}%)`);
        });
    console.log('\n');
};

// Analyze the distributions
analyzeDistribution(sampleLogs, log => log.split(' ')[0], 'IP');
analyzeDistribution(sampleLogs, log => log.split('"')[1].split(' ')[1], 'Path');