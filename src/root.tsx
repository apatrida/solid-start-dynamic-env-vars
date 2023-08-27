// @refresh reload
import {
    Suspense
} from "solid-js";
import {
    A,
    Body,
    ErrorBoundary,
    FileRoutes,
    Head,
    Html,
    Meta,
    Routes,
    Scripts,
    Title
} from "solid-start";
import "./root.css";
import {SafeServerEnvProvider} from "~/lib/SafeServerEnv";


export default function Root() {
    return (
        <Html lang="en">
            <Head>
                <Title>SolidStart - Bare</Title>
                <Meta charset="utf-8"/>
                <Meta name="viewport" content="width=device-width, initial-scale=1"/>
            </Head>
            <Body>
                <Suspense>
                    <ErrorBoundary>
                        <A href="/">Index</A>
                        <A href="/about">About</A>
                        {/* This must be added before Routes if you want other routeData to read these variables on client */}
                        <SafeServerEnvProvider includeEnvVariables={true}
                                                  envVariablePrefix={"VITE_"}
                                                  envVariableList={["USER", "SOMETHING", "WHATEVER"]}
                                                  customConfiguration={{"foo": "bar"}}>
                            <Routes>
                                <FileRoutes/>
                            </Routes>
                        </SafeServerEnvProvider>
                    </ErrorBoundary>
                </Suspense>
                <Scripts/>
            </Body>
        </Html>
    );
}
