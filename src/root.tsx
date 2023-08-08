// @refresh reload
import {
    Accessor,
    Context,
    createContext,
    createSignal,
    ParentComponent,
    Resource, Show,
    Suspense,
    useContext
} from "solid-js";
import {
    A,
    Body,
    ErrorBoundary,
    FileRoutes,
    Head,
    Html,
    Meta,
    Route,
    Routes,
    Scripts,
    Title, useRouteData,
} from "solid-start";
import "./root.css";
import {isServer} from "solid-js/web";
import {Outlet} from "@solidjs/router";
import {EnvConfigMap, EnvConfigurationContext, EnvConfigurationProvider, loadEnvironment} from "~/lib/EnvConfiguration";
import {createServerData$} from "solid-start/server";

const envLoader = () => {
    return loadEnvironment({
        includeEnvVariables: true,
        stripPrefix: true,
        envVariablePrefix: "VITE_",
        envVariableList: ["SOMETHING", "WHATEVER"],
        customConfiguration: { "foo": "bar" }
    });
}

const envBaseCfg = envLoader();

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
                        <EnvConfigurationProvider configuration={envBaseCfg}>
                            <A href="/">Index</A>
                            <A href="/about">About</A>
                           <Routes>
                                <Route path={"/"} data={topLevelRouteData} element={Parenty()}>
                                   <FileRoutes/>
                                </Route>
                            </Routes>
                        </EnvConfigurationProvider>
                    </ErrorBoundary>
            </Suspense>
            <Scripts/>
        </Body>
</Html>
);
}



function topLevelRouteData() {
    return createServerData$(() => {
        return envBaseCfg || envLoader();
    });
}

function Parenty() {
    const staticCfg = useContext(EnvConfigurationContext);
    const cfg = useRouteData<typeof topLevelRouteData>();
    return (<>
                <hr/>
                <EnvConfigurationProvider configuration={cfg() || staticCfg || {} as EnvConfigMap}>
                    <Outlet/>
                </EnvConfigurationProvider>
        </>
    )
}
