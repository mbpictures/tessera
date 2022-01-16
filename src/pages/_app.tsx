import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "../style/Global.scss";
import { StepperContainer } from "../components/StepperContainer";
import { useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence } from "framer-motion";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { SessionProvider } from "next-auth/react";
import { ThemeConfig } from "../components/admin/ThemeProvider";
import { SnackbarProvider } from "notistack";

export default function Global({ Component, pageProps }) {
    const router = useRouter();
    const [direction, setDirection] = useState<number>(0);

    if (router.pathname.startsWith("/admin")) {
        return (
            <SessionProvider
                session={pageProps.session}
                basePath={process.env.NEXT_PUBLIC_NEXTAUTH_PATH}
            >
                <ThemeConfig>
                    <SnackbarProvider maxSnack={3}>
                        <Component {...pageProps} />
                    </SnackbarProvider>
                </ThemeConfig>
            </SessionProvider>
        );
    }

    return (
        <Provider store={store}>
            <StepperContainer
                onBack={() => setDirection(-1)}
                onNext={() => setDirection(1)}
                disableOverflow={pageProps.disableOverflow ?? false}
                noNext={pageProps.noNext ?? false}
            >
                <AnimatePresence exitBeforeEnter initial={false}>
                    <Component
                        {...pageProps}
                        key={router.pathname}
                        direction={direction}
                    />
                </AnimatePresence>
            </StepperContainer>
        </Provider>
    );
}
