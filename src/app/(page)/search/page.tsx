"use client";
import React, { useState, useEffect } from 'react';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Input,
    Select,
    Button,
    HStack,
    VStack,
    Text,
    useColorMode,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';

const LogTablePage = () => {
    interface Log {
        ip: string;
        date: string;
        method: string;
        path: string;
        protocol: string;
        status: string;
        size: string;
    }

    const [logs, setLogs] = useState<Log[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [methodFilter, setMethodFilter] = useState('');
    const [ipFilter, setIpFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [pathFilter, setPathFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Log; direction: 'ascending' | 'descending' } | null>(null);
    const [usingSampleData, setUsingSampleData] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { colorMode } = useColorMode();

    const columnWidths = {
        ip: '300px',
        date: '200px',
        method: '100px',
        path: '300px',
        protocol: '120px',
        status: '90px',
        size: '100px',
    };

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/parselog');
                if (!response.ok) {
                    throw new Error('Failed to fetch log data');
                }
                const data = await response.json();
                if (!data.logLines || data.logLines.length === 0) {
                    throw new Error('No log data received');
                }
                const parsedLogs = parseLogLines(data.logLines);
                setLogs(parsedLogs);
                setFilteredLogs(parsedLogs);
                setUsingSampleData(false);
            } catch (error) {
                console.error('Error fetching log data:', error);
                setError((error as Error).message);
                setUsingSampleData(true);
                // You might want to set some sample data here if available
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const parseLogLines = (logLines: string[]): Log[] => {
        return logLines.map(log => {
            const regex = /^(\S+) \S+ \S+ \[(.*?)\] "([^"]*)" (\d+) (\d+)(?: "([^"]*)" "([^"]*)")?/;
            const match = log.match(regex);
            if (match) {
                const [, ip, dateTime, request, status, size] = match;
                const [date, time] = dateTime.split(':');
                const [method, path, protocol] = request.split(' ');
                return {
                    ip,
                    date: `${date} ${time}`,
                    method: method || '-',
                    path: path || '-',
                    protocol: protocol || '-',
                    status,
                    size
                };
            }
            return null;
        }).filter((log): log is Log => log !== null);
    };

    useEffect(() => {
        let filtered = logs.filter(log => {
            const matchesSearch = Object.values(log).some(value =>
                value.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesStatus = statusFilter === '' || log.status === statusFilter;
            const matchesMethod = methodFilter === '' || log.method === methodFilter;
            const matchesIp = ipFilter === '' || log.ip === ipFilter;
            const matchesDate = dateFilter === '' || log.date.includes(dateFilter);
            const matchesPath = pathFilter === '' || log.path.includes(pathFilter);
            return matchesSearch && matchesStatus && matchesMethod && matchesIp && matchesDate && matchesPath;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredLogs(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, methodFilter, ipFilter, dateFilter, pathFilter, logs, sortConfig]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const uniqueStatuses = Array.from(new Set(logs.map(log => log.status))).sort();
    const uniqueIps = Array.from(new Set(logs.map(log => log.ip))).sort();
    const methodOrder = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE'];
    const uniqueMethods = Array.from(new Set(logs.map(log => log.method)))
        .sort((a, b) => {
            const indexA = methodOrder.indexOf(a);
            const indexB = methodOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

    const requestSort = (key: keyof Log) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Log) => {
        if (!sortConfig || sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? <ChevronUpIcon /> : <ChevronDownIcon />;
    };

    if (isLoading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    if (error) {
        return (
            <Alert status='error' mb={4} borderRadius={'full'}>
                <AlertIcon />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Box>
            {usingSampleData && (
                <Alert status='warning' mb={4} borderRadius={'full'}>
                    <AlertIcon />
                    <AlertTitle>Using Sample Data</AlertTitle>
                    <AlertDescription>Unable to read log data from server. Displaying sample data instead.</AlertDescription>
                </Alert>
            )}
            <VStack spacing={4} align="stretch" mb={4}>
                <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <HStack>
                    <Select
                        placeholder="Filter by IP"
                        value={ipFilter}
                        onChange={(e) => setIpFilter(e.target.value)}
                    >
                        <option value="">All IPs</option>
                        {uniqueIps.map(ip => (
                            <option key={ip} value={ip}>{ip}</option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Filter by status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {uniqueStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Filter by method"
                        value={methodFilter}
                        onChange={(e) => setMethodFilter(e.target.value)}
                    >
                        {uniqueMethods.map(method => (
                            <option key={method} value={method}>{method}</option>
                        ))}
                    </Select>
                    <Select
                        value={itemsPerPage.toString()}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value="10">10 per page</option>
                        <option value="25">25 per page</option>
                        <option value="50">50 per page</option>
                        <option value="100">100 per page</option>
                    </Select>
                </HStack>
            </VStack>
            <Box overflowX="auto">
                <Table variant="simple" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <Thead>
                        <Tr>
                            {(Object.keys(columnWidths) as Array<keyof typeof columnWidths>).map((key) => (
                                <Th
                                    key={key}
                                    onClick={() => requestSort(key as keyof Log)}
                                    cursor="pointer"
                                    width={columnWidths[key]}
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                >
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                    {getSortIcon(key as keyof Log)}
                                </Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentItems.map((log, index) => (
                            <Tr key={index}>
                                {(Object.keys(columnWidths) as Array<keyof Log>).map((key) => (
                                    <Td
                                        key={key}
                                        width={columnWidths[key]}
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                    >
                                        {log[key]}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
            <HStack mt={4} justify="center">
                <Button
                    onClick={() => paginate(currentPage - 1)}
                    isDisabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Text>{`Page ${currentPage} of ${Math.ceil(filteredLogs.length / itemsPerPage)}`}</Text>
                <Button
                    onClick={() => paginate(currentPage + 1)}
                    isDisabled={indexOfLastItem >= filteredLogs.length}
                >
                    Next
                </Button>
            </HStack>
        </Box>
    );
};

export default LogTablePage;