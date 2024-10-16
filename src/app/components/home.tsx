import {
    Box,
    Flex,
    Stack,
    Heading,
    Text,
    Container,
    Input,
    Button,
    SimpleGrid,
    useBreakpointValue,
    IconProps,
    Icon,
    FormControl,
    FormLabel,
    Checkbox,
    Link,
    useColorMode,
} from '@chakra-ui/react'
import { color } from 'framer-motion'

const avatars = [
    {
        name: 'Ryan Florence',
        url: 'https://bit.ly/ryan-florence',
    },
    {
        name: 'Segun Adebayo',
        url: 'https://bit.ly/sage-adebayo',
    },
    {
        name: 'Kent Dodds',
        url: 'https://bit.ly/kent-c-dodds',
    },
    {
        name: 'Prosper Otemuyiwa',
        url: 'https://bit.ly/prosper-baba',
    },
    {
        name: 'Christian Nwamba',
        url: 'https://bit.ly/code-beast',
    },
]

const Blur = (props: IconProps) => {
    return (
        <Icon
            width={useBreakpointValue({ base: '100%', md: '40vw', lg: '30vw' })}
            zIndex={useBreakpointValue({ base: -1, md: -1, lg: 0 })}
            height="560px"
            viewBox="0 0 528 560"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}>
            <circle cx="71" cy="61" r="111" fill="#3182CE" />
            <circle cx="244" cy="106" r="139" fill="#4299E1" />
            <circle cy="291" r="139" fill="#4299E1" />
            <circle cx="80.5" cy="189.5" r="101.5" fill="#63B3ED" />
            <circle cx="196.5" cy="317.5" r="101.5" fill="#90CDF4" />
            <circle cx="70.5" cy="458.5" r="101.5" fill="#BEE3F8" />
            <circle cx="426.5" cy="-0.5" r="101.5" fill="#2B6CB0" />
        </Icon>
    )
}

export default function Home() {
    const cardBg = useColorMode().colorMode === 'dark' ? 'gray.700' : 'white'
    return (
        <Box
            position={'relative'}
            height="100vh" // Set the height to full viewport height
            display="flex"
            alignItems="center" // Vertically center the content
        >
            <Container
                as={SimpleGrid}
                maxW={'7xl'}
                columns={{ base: 1, md: 2 }}
                spacing={{ base: 10, lg: 10 }}
                py={20} // Add some vertical padding
            >
                <Stack
                    spacing={{ base: 10, md: 20 }}
                    display={{ base: 'none', md: 'flex' }}
                    justifyContent={{ base: 'flex-start', md: 'center' }}>
                    <Heading
                        lineHeight={1.1}
                        fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}>
                        Welcome to{' '}
                        <Text as={'span'} bgGradient="linear(to-r, blue.400,blue.600)" bgClip="text">
                            CLF Log Analyzer
                        </Text>
                    </Heading>
                </Stack>
                <Flex
                    align={'center'}
                    justify={'center'}
                >
                    <Stack
                        bg={cardBg}
                        rounded={'xl'}
                        p={{ base: 4, sm: 6, md: 8 }}
                        spacing={{ base: 8 }}
                        maxW={{ lg: 'lg' }}
                    >
                        <Stack spacing={4}>
                            <Heading
                                lineHeight={1.1}
                                fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}>
                                Log in to your account
                            </Heading>
                        </Stack>
                        <Box as={'form'} mt={10}>
                            <Stack spacing={4}>
                                <FormControl id="email">
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        placeholder="Enter your username"
                                        bg={'gray.100'}
                                        border={0}
                                        color={'gray.500'}
                                        _placeholder={{
                                            color: 'gray.500',
                                        }}
                                    />
                                </FormControl>
                                <FormControl id="password">
                                    <FormLabel>Password</FormLabel>
                                    <Input
                                        type="password"
                                        placeholder="Enter your password"
                                        bg={'gray.100'}
                                        border={0}
                                        color={'gray.500'}
                                        _placeholder={{
                                            color: 'gray.500',
                                        }}
                                    />
                                </FormControl>
                                <Stack spacing={10}>
                                    <Stack
                                        direction={{ base: 'column', sm: 'row' }}
                                        align={'start'}
                                        justify={'space-between'}>
                                        <Checkbox>Remember me</Checkbox>
                                        <Link color={'blue.400'}>Forgot password?</Link>
                                    </Stack>
                                    <Button
                                        fontFamily={'heading'}
                                        w={'full'}
                                        bgGradient="linear(to-r, blue.400,blue.600)"
                                        color={'white'}
                                        _hover={{
                                            bgGradient: 'linear(to-r, blue.400,blue.600)',
                                            boxShadow: 'xl',
                                        }}>
                                        Sign in
                                    </Button>
                                </Stack>
                            </Stack>
                            <Stack pt={6}>
                                <Text align={'center'}>
                                    Don't have an account? <Link color={'blue.400'}>Sign up</Link>
                                </Text>
                            </Stack>
                        </Box>
                    </Stack>
                </Flex>
            </Container>
            <Blur position={'absolute'} top={-10} left={-10} style={{ filter: 'blur(70px)' }} />
        </Box>
    )
}