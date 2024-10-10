import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, Heading, SimpleGrid, Text, Center, Spinner, useColorMode, Table, Thead, Tbody, Tr, Th, Td, Select, Button, HStack, Flex, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { sampleLogs } from '@/lib/samplelog';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Column {
    header: string;
    accessor: string;
    width?: string;
}

interface PaginatedTableProps {
    data: any[];
    columns: Column[];
    initialSortColumn: string;
    initialSortDirection: 'ascending' | 'descending';
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({ data, columns, initialSortColumn, initialSortDirection }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: initialSortColumn, direction: initialSortDirection });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const sortedData = React.useMemo(() => {
        let sortableItems = [...data];
        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [data, sortConfig]);

    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name: string) => {
        if (sortConfig.key !== name) {
            return <ChevronUpIcon opacity={0.3} />;
        }
        return sortConfig.direction === 'ascending' ? <ChevronUpIcon /> : <ChevronDownIcon />;
    };

    return (
        <Box overflowX="auto">
            <Table variant="simple" size="sm">
                <Thead>
                    <Tr>
                        {columns.map((column, index) => (
                            <Th
                                key={index}
                                onClick={() => requestSort(column.accessor)}
                                cursor="pointer"
                                width={column.width || 'auto'}
                            >
                                <Flex alignItems="center" justifyContent="space-between">
                                    <Box>{column.header}</Box>
                                    <Box ml={2}>{getSortIcon(column.accessor)}</Box>
                                </Flex>
                            </Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {currentItems.map((item, rowIndex) => (
                        <Tr key={rowIndex}>
                            {columns.map((column, colIndex) => (
                                <Td key={colIndex} width={column.width || 'auto'}>{item[column.accessor]}</Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            <HStack mt={4} justify="space-between">
                <Select
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    mb={2}
                    w="200px"
                >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                </Select>
                <HStack>
                    <Button
                        onClick={() => paginate(currentPage - 1)}
                        isDisabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Text>{`Page ${currentPage} of ${Math.ceil(sortedData.length / itemsPerPage)}`}</Text>
                    <Button
                        onClick={() => paginate(currentPage + 1)}
                        isDisabled={indexOfLastItem >= sortedData.length}
                    >
                        Next
                    </Button>
                </HStack>
            </HStack>
        </Box>
    );
};

const Dashboard = () => {
    const [statusCodes, setStatusCodes] = useState({});
    const [topIPs, setTopIPs] = useState<[string, number][]>([]);
    const [topPaths, setTopPaths] = useState<[string, number][]>([]);
    const [requestsOverTime, setRequestsOverTime] = useState<{ [key: string]: number }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [usingSampleData, setUsingSampleData] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { colorMode } = useColorMode();

    useEffect(() => {
        const fetchAndParseLogs = async () => {
            try {
                console.log('Fetching logs...');
                const response = await fetch('/api/parselog');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Received data:', data);
                if (!data.logLines || data.logLines.length === 0) {
                    throw new Error('No log lines received');
                }
                setUsingSampleData(false);
                setErrorMessage(null);
                parseLogs(data.logLines);
            } catch (error) {
                console.error('Error fetching log data:', error);
                if (error instanceof Error) {
                    setErrorMessage(`Error fetching log data: ${error.message}`);
                } else {
                    setErrorMessage('An unknown error occurred');
                }
                console.warn('Falling back to sample data');
                parseLogs(sampleLogs);
                setUsingSampleData(true);
            }
        };

        const parseLogs = (logLines: string[]) => {
            console.log('Parsing logs. Number of lines:', logLines.length);
            const codes: { [key: string]: number } = {};
            const ips: { [key: string]: number } = {};
            const paths: { [key: string]: number } = {};
            const timeData: { [key: string]: number } = {};

            logLines.forEach(log => {
                const regex = /^(\S+) \S+ \S+ \[(.*?)\] "([^"]*)" (\d+) (\d+)(?: "([^"]*)" "([^"]*)")?/;
                const match = log.match(regex);

                if (match) {
                    const [, ip, dateTime, request, status, size, referer, userAgent] = match;
                    const [date, time] = dateTime.split(':');
                    const hour = time;

                    const path = request.split(' ')[1] || '-';

                    codes[status] = (codes[status] || 0) + 1;
                    ips[ip] = (ips[ip] || 0) + 1;
                    paths[path] = (paths[path] || 0) + 1;
                    timeData[hour] = (timeData[hour] || 0) + 1;
                } else {
                    console.warn('Failed to parse log line:', log);
                }
            });

            console.log('Parsed data:', { codes, ips: Object.keys(ips).length, paths: Object.keys(paths).length, timeData });

            setStatusCodes(codes);
            setTopIPs(Object.entries(ips).sort((a, b) => b[1] - a[1]));
            setTopPaths(Object.entries(paths).sort((a, b) => b[1] - a[1]));
            setRequestsOverTime(timeData);
            setIsLoading(false);
        };

        fetchAndParseLogs();
    }, []);

    const getStatusCodeColor = (code: string) => {
        const codeNum = parseInt(code);
        if (codeNum >= 500) return '#8B0000';
        if (codeNum >= 400) return '#D2691E';
        if (codeNum >= 300) return '#DAA520';
        if (codeNum >= 200) return '#2E8B57';
        return '#4682B4';
    };

    const chartTheme = {
        mode: colorMode,
        palette: 'palette1',
    };

    const commonChartOptions = {
        theme: chartTheme,
        tooltip: {
            theme: colorMode,
        },
    };

    const pathAccessChart = {
        options: {
            ...commonChartOptions,
            chart: {
                type: 'bar' as const,
                height: 500  // Increased height for better visibility
            },
            xaxis: {
                categories: topPaths.slice(0, 20).map(([path]) => path),
                labels: {
                    rotate: -45,
                    trim: true,
                    maxHeight: 120,
                },
            },
            yaxis: {
                title: {
                    text: 'Number of Requests'
                }
            },
            dataLabels: {
                enabled: false,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                }
            },
        },
        series: [{
            name: 'Requests',
            data: topPaths.slice(0, 20).map(([, count]) => count),
        }],
    };

    const visitorChart = {
        options: {
            ...commonChartOptions,
            chart: {
                type: 'bar' as const,
                height: 500  // Increased height for better visibility
            },
            xaxis: {
                categories: topIPs.slice(0, 20).map(([ip]) => ip),
                labels: {
                    rotate: -45,
                    trim: true,
                    maxHeight: 120,
                },
            },
            yaxis: {
                title: {
                    text: 'Number of Requests'
                }
            },
            dataLabels: {
                enabled: false,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                }
            },
        },
        series: [{
            name: 'Requests',
            data: topIPs.slice(0, 20).map(([, count]) => count),
        }],
    };

    const statusCodeChart = {
        options: {
            ...commonChartOptions,
            chart: {
                type: 'pie' as const,
            },
            labels: Object.keys(statusCodes),
            colors: Object.keys(statusCodes).map(getStatusCodeColor),
            plotOptions: {
                pie: {
                    expandOnClick: false
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val: number, opts: { w: { config: { labels: string[], series: number[] } }, seriesIndex: number }) {
                    return opts.w.config.labels[opts.seriesIndex] + ": " + opts.w.config.series[opts.seriesIndex];
                }
            },
            legend: {
                show: true,
                position: 'bottom' as const,
                fontSize: '14px',
                formatter: function (seriesName: string, opts: { w: { globals: { series: number[] } }, seriesIndex: number }) {
                    return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
                }
            },
            tooltip: {
                y: {
                    formatter: function (value: number) {
                        return value + " requests";
                    }
                }
            }
        },
        series: Object.values(statusCodes),
    };

    const timeSeriesChart = {
        options: {
            ...commonChartOptions,
            chart: {
                type: 'area' as const,
                zoom: {
                    enabled: true
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth' as const,
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.9,
                    stops: [0, 90, 100]
                }
            },
            xaxis: {
                categories: Object.keys(requestsOverTime).sort(),
                title: {
                    text: 'Hour'
                }
            },
            yaxis: {
                title: {
                    text: 'Number of Requests'
                }
            }
        },
        series: [{
            name: 'Requests',
            data: Object.keys(requestsOverTime).sort().map(key => requestsOverTime[key])
        }],
    };

    if (isLoading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    console.log('Rendering with data:', { statusCodes, topIPs, topPaths, requestsOverTime });

    return (
        <Box>
            {usingSampleData && (
                <Alert status='warning' mb={4} borderRadius={'full'}>
                    <AlertIcon />
                    <AlertTitle>Using Sample Data</AlertTitle>
                    <AlertDescription>
                        Unable to read local log file. Displaying sample data instead.
                        {errorMessage && <Text mt={2}>Error details: {errorMessage}</Text>}
                    </AlertDescription>
                </Alert>
            )}
            {Object.keys(statusCodes).length === 0 && (
                <Alert status='error' mb={4} borderRadius={'full'}>
                    <AlertIcon />
                    <AlertTitle>No Data Available</AlertTitle>
                    <AlertDescription>
                        No log data could be parsed. Please check the log file format.
                    </AlertDescription>
                </Alert>
            )}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box borderWidth={1} borderRadius="lg" p={4}>
                    <Heading as="h2" size="lg" mb={4}>Top 20 Path Access</Heading>
                    <Chart
                        options={pathAccessChart.options}
                        series={pathAccessChart.series}
                        type="bar"
                        height={500}  // Increased height
                    />
                    <PaginatedTable
                        data={topPaths.map(([path, count]) => ({ path, count }))}
                        columns={[
                            { header: 'Path', accessor: 'path', width: '70%' },
                            { header: 'Requests', accessor: 'count', width: '30%' },
                        ]}
                        initialSortColumn="count"
                        initialSortDirection="descending"
                    />
                </Box>

                <Box borderWidth={1} borderRadius="lg" p={4}>
                    <Heading as="h2" size="lg" mb={4}>Top 20 Visitors</Heading>
                    <Chart
                        options={visitorChart.options}
                        series={visitorChart.series}
                        type="bar"
                        height={500}  // Increased height
                    />
                    <PaginatedTable
                        data={topIPs.map(([ip, count]) => ({ ip, count }))}
                        columns={[
                            { header: 'IP Address', accessor: 'ip', width: '70%' },
                            { header: 'Requests', accessor: 'count', width: '30%' },
                        ]}
                        initialSortColumn="count"
                        initialSortDirection="descending"
                    />
                </Box>

                <Box borderWidth={1} borderRadius="lg" p={4}>
                    <Heading as="h2" size="lg" mb={4}>Status Codes Distribution</Heading>
                    <Chart
                        options={statusCodeChart.options}
                        series={statusCodeChart.series as ApexNonAxisChartSeries}
                        type="pie"
                        height={350}
                    />
                    <PaginatedTable
                        data={Object.entries(statusCodes).map(([code, count]) => ({ code, count }))}
                        columns={[
                            { header: 'Status Code', accessor: 'code', width: '50%' },
                            { header: 'Count', accessor: 'count', width: '50%' },
                        ]}
                        initialSortColumn="count"
                        initialSortDirection="descending"
                    />
                </Box>


                <Box borderWidth={1} borderRadius="lg" p={4}>
                    <Heading as="h2" size="lg" mb={4}>Requests Over Time</Heading>
                    <Chart
                        options={timeSeriesChart.options}
                        series={timeSeriesChart.series}
                        type="area"
                        height={350}
                    />
                    <PaginatedTable
                        data={Object.entries(requestsOverTime)
                            .sort((a, b) => a[0].localeCompare(b[0]))
                            .map(([hour, count]) => ({ hour, count }))}
                        columns={[
                            { header: 'Hour', accessor: 'hour', width: '50%' },
                            { header: 'Requests', accessor: 'count', width: '50%' },
                        ]}
                        initialSortColumn="hour"
                        initialSortDirection="ascending"
                    />
                </Box>
            </SimpleGrid>
        </Box>
    );
};

export default Dashboard;