import {Title, useRouteData, createRouteData} from "solid-start";
import {refetchRouteData} from 'solid-start';
import Counter from "~/components/Counter";
import {createEffect, onMount} from "solid-js";
import server$, {createServerData$} from 'solid-start/server';
import {useSafeServerEnv, useServerEnv$, useServerEnvFromContext} from "~/lib/useSafeServerEnv";

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function routeData() {
    const cfg = useSafeServerEnv();

    return {
        canBeClient: createRouteData(() => {
            // use captured cfg so that this works during refetchRouteData, otherwise will be undefined
            return `${cfg.getOptional("SOMETHING")} ${getRandomInt(1000, 9999)}`;
        }),
        onlyServer: createServerData$(() => {
            const cfg = useServerEnv$();
            console.log("In createServerData$ 1, passed value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
            console.log("in createServerData$ 1, passed value of `USER`: ", cfg.getRequired("USER"));

            return `${cfg.getOptional("SOMETHING")} ${getRandomInt(1000, 9999)}`;
        }),
        onlyServerViaKey: createServerData$(([somethingValue, viteValue, userValue]) => {
            console.log("In createServerData$ 2, passed value of `VITE_SOME_VALUE`: ", viteValue);
            console.log("in createServerData$ 2, passed value of `USER`: ", userValue);

            return `${somethingValue} ${getRandomInt(1000, 9999)}`;
        }, {
            key: () => [cfg.getOptional("SOMETHING"), cfg.getRequired("VITE_SOME_VALUE"), cfg.getRequired("USER")]
        })
    };
}

export default function Home() {
    const data = useRouteData<typeof routeData>();

    onMount(() => {
        const cfg = useServerEnvFromContext();
        console.log("In onMount, value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
        console.log("in onMount, value of `USER`: ", cfg.getRequired("USER"));
    });

    onMount(async () => {
        const cfg = useServerEnvFromContext();
        console.log("In onMount async, value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
        console.log("in onMount async, value of `USER`: ", cfg.getRequired("USER"));
    });

    // and server$ calls should work too!
    onMount(async () => {
        const serverFunc = server$(() => {
            const cfg = useServerEnv$();
            console.log("In server$ call, value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
            console.log("In server$ call, value of `USER`: ", cfg.getRequired("USER"));
            return cfg.getRequired("SOMETHING");
        });
        const value = await serverFunc();
        console.log("server$ function returned contents of env var `SOMETHING`", value);
    });

    createEffect(() => {
        const cfg = useServerEnvFromContext();
        console.log("In createEffect, value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
        console.log("in createEffect, value of `USER`: ", cfg.getRequired("USER"));
    });

    createEffect(async () => {
        const cfg = useServerEnvFromContext();
        console.log("In createEffect async, value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
        console.log("in createEffect async, value of `USER`: ", cfg.getRequired("USER"));
    })

    // Here we use only from context provider to ensure we don't accidentally pick up the server version since component
    // body and rendering should always have a provider.
    const cfg = useServerEnvFromContext();

    return (
        <main>
            <Title>Hello World</Title>
            <h1>Hello world!</h1>
            <Counter/>
            <p>
                Configuration:
            </p>

            <div>VITE_SOME_VALUE: {cfg.getRequired("VITE_SOME_VALUE")}</div>
            <div>VITE_OTHER_VALUE: {cfg.getRequired("VITE_OTHER_VALUE")}</div>
            <div>SOMETHING: {cfg.getRequired("SOMETHING")}</div>
            <div>WHATEVER: {cfg.getRequired("WHATEVER")}</div>
            <div>USER: {cfg.getRequired("USER")}</div>
            <div>SHELL: {cfg.getOptional("SHELL")} (<i>should not be returned, not in whitelist</i>)</div>
            <div>HOME: {cfg.getOptional("HOME")} (<i>should not be returned, not in whitelist</i>)</div>
            <div>&nbsp;</div>
            {/* important that refretch does not lose the context of the env variables */}
            <div>
                <div style={"background-color: #600; color: #FFF"} onClick={() => {
                    refetchRouteData()
                }}>
                    CLICK ME TO REFETCH (should not break counter or other state)
                </div>
                <div>&nbsp;</div>
                <div>routeData client-only: {data.canBeClient()} </div>
                <div>routeData server: {data.onlyServer()} </div>
                <div>routeData server via key: {data.onlyServerViaKey()}</div>
            </div>

        </main>
    );
}
