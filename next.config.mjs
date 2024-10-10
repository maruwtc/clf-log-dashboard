/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@chakra-ui/react", "@chakra-ui/core"],
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        return config;
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
