import { extendTheme, type ThemeConfig } from "@chakra-ui/react"
import { mode } from "@chakra-ui/theme-tools";

const config: ThemeConfig = {
    initialColorMode: "system",
    useSystemColorMode: true,
}

const theme = extendTheme({
    config,
    styles: {
        global: (props: Record<string, any>) => ({
            body: {
                bg: mode("white", "gray.800")(props),
            }
        })
    }
})

export default theme