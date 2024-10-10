'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
    IconButton,
    Box,
    CloseButton,
    Flex,
    HStack,
    Icon,
    useColorModeValue,
    Text,
    Drawer,
    DrawerContent,
    useDisclosure,
    BoxProps,
    FlexProps,
    useColorMode,
} from '@chakra-ui/react'
import {
    FiMenu,
    FiMoon,
    FiSun,
} from 'react-icons/fi'
import { IconType } from 'react-icons'
import { TbLayoutSidebarRightExpand, TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";

interface LinkItemProps {
    name: string
    icon: IconType
    path: string
}

interface NavItemProps extends FlexProps {
    icon: IconType
    children: React.ReactNode
    path: string
    isActive: boolean
}

interface SidebarProps extends BoxProps {
    onClose: () => void
    isExpanded: boolean
    onToggle: () => void
}

const LinkItems: Array<LinkItemProps> = [
    { name: 'Dashboard', icon: LuLayoutDashboard, path: '/' },
    { name: 'Search', icon: IoSearch, path: '/search' },
]

export const SidebarWithHeader = ({ children }: { children: React.ReactNode }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [isExpanded, setIsExpanded] = useState(false)
    const pathname = usePathname()

    const onToggle = () => setIsExpanded(!isExpanded)

    const currentLinkItem = LinkItems.find(item => item.path === pathname) || LinkItems[0]

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
            <HorizontalBar onOpen={onOpen} currentLinkItem={currentLinkItem} />
            <Flex>
                <SidebarContent
                    onClose={() => onClose}
                    isExpanded={isExpanded}
                    onToggle={onToggle}
                    currentPath={pathname}
                    display={{ base: 'none', md: 'block' }}
                />
                <Drawer
                    isOpen={isOpen}
                    placement="left"
                    onClose={onClose}
                    returnFocusOnClose={false}
                    onOverlayClick={onClose}
                    size="full">
                    <DrawerContent>
                        <SidebarContent
                            onClose={onClose}
                            isExpanded={true}
                            onToggle={onToggle}
                            currentPath={pathname}
                            isMobile={true}
                        />
                    </DrawerContent>
                </Drawer>
                <Box
                    ml={{ base: 0, md: isExpanded ? 60 : 16 }}
                    p="4"
                    width="full"
                    transition="margin-left 0.3s"
                    pt={{ base: 0, md: "20" }}
                    bg={useColorModeValue('white', 'gray.900')}
                    minH={"100vh"}
                >
                    {children}
                </Box>
            </Flex>
        </Box>
    )
}

const HorizontalBar = ({ onOpen, currentLinkItem }: { onOpen: () => void, currentLinkItem: LinkItemProps }) => {
    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Flex
            px={4}
            height="16"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent="space-between"
            width="full"
            position={{ base: 'relative', md: 'fixed' }}
            top={0}
            zIndex="sticky"
        >
            <HStack spacing={4}>
                <IconButton
                    display={{ base: 'flex', md: 'none' }}
                    onClick={onOpen}
                    variant="outline"
                    aria-label="open menu"
                    icon={<FiMenu />}
                />
                <Text
                    fontSize={{ base: 'md', md: '2xl' }}
                    fontFamily="monospace"
                    fontWeight="bold">
                    CLF Log Analyzer -  {currentLinkItem.name}
                </Text>
            </HStack>
            <HStack spacing={4}>
                <IconButton
                    size="md"
                    variant="ghost"
                    aria-label="toggle theme"
                    icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                    onClick={toggleColorMode}
                    _hover={{ bg: 'transparent' }}
                />
            </HStack>
        </Flex>
    )
}


const SidebarContent = ({
    onClose,
    isExpanded,
    onToggle,
    currentPath,
    isMobile = false,
    ...rest
}: SidebarProps & { currentPath: string, isMobile?: boolean }) => {
    return (
        <Box
            transition="width 0.3s"
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: isExpanded ? 60 : 16 }}
            pos="fixed"
            h={isMobile ? "full" : "calc(100vh - 4rem)"}
            top={isMobile ? 0 : "4rem"}
            {...rest}
        >
            <Flex flexDirection="column" h="full">
                {isMobile && (
                    <Flex h="20" alignItems="center" mx="6" justifyContent="space-between">
                        <CloseButton onClick={onClose} />
                    </Flex>
                )}
                <Flex direction="column" flex={1}>
                    {LinkItems.map((link) => (
                        <NavItem
                            key={link.name}
                            icon={link.icon}
                            path={link.path}
                            isExpanded={isExpanded || isMobile}
                            isActive={currentPath === link.path}
                            h={"16"}
                            justifyContent={(isExpanded || isMobile) ? 'flex-start' : 'center'}
                        >
                            {link.name}
                        </NavItem>
                    ))}
                </Flex>
                {!isMobile && (
                    <ExpandButton isExpanded={isExpanded} onClick={onToggle} />
                )}
            </Flex>
        </Box>
    )
}

const ExpandButton = ({ isExpanded, onClick }: { isExpanded: boolean, onClick: () => void }) => {
    return (
        <Flex
            position="absolute"
            right="-3"
            top="50%"
            transform="translateY(-50%)"
            alignItems="center"
            justifyContent="center"
            h="24"
            w="6"
            rounded="full"
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow="md"
            cursor="pointer"
            onClick={onClick}
            transition="0.2s ease"
            _hover={{
                bg: useColorModeValue('gray.100', 'gray.700'),
            }}
        >
            <Icon
                as={isExpanded ? TbLayoutSidebarRightExpand : TbLayoutSidebarLeftExpand}
                w="4"
                h="4"
            />
        </Flex>
    )
}

const NavItem = ({ icon, children, path, isActive, isExpanded, ...rest }: NavItemProps & { isExpanded: boolean }) => {
    return (
        <Box
            as="a"
            href={path}
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="full"
                role="group"
                cursor="pointer"
                _hover={{
                    bg: 'blue.700',
                    color: 'white',
                    borderRadius: 'full',
                }}
                position="relative"
                flexDirection={isExpanded ? "row" : "column"}
                {...rest}
            >
                <Box position="relative">
                    <Icon
                        fontSize="16"
                        _groupHover={{
                            color: 'white',
                        }}
                        as={icon}
                    />
                    {isActive && !isExpanded && (
                        <Box
                            position="absolute"
                            bottom="-8px"
                            left="50%"
                            transform="translateX(-50%)"
                            w="4px"
                            h="4px"
                            borderRadius="full"
                            bg="blue.500"
                            className="blinking-dot"
                            sx={{
                                '@keyframes blink': {
                                    '0%': { opacity: 0 },
                                    '50%': { opacity: 1 },
                                    '100%': { opacity: 0 },
                                },
                                animation: 'blink 1s infinite',
                            }}
                        />
                    )}
                </Box>
                {isExpanded && (
                    <Text ml="4">
                        {children}
                    </Text>
                )}
                {isActive && isExpanded && (
                    <Box
                        position="absolute"
                        right={8}
                        top="50%"
                        transform="translateY(-50%)"
                        w="2"
                        h="2"
                        borderRadius="full"
                        bg="blue.500"
                        className="blinking-dot"
                        sx={{
                            '@keyframes blink': {
                                '0%': { opacity: 0 },
                                '50%': { opacity: 1 },
                                '100%': { opacity: 0 },
                            },
                            animation: 'blink 1s infinite',
                        }}
                    />
                )}
            </Flex>
        </Box>
    )
}