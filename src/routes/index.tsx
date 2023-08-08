import {Title, useRouteData, createRouteData} from "solid-start";
import { refetchRouteData } from 'solid-start';
import Counter from "~/components/Counter";
import useServerEnvironment, {DynamicServerEnv} from "~/lib/EnvConfiguration";
import {createEffect, onMount} from "solid-js";
import server$ from 'solid-start/server';

function checkEnvExists(calledWhen: string): DynamicServerEnv {
   return useServerEnvironment(calledWhen);
}

async function asyncCheckEnvExists(calledWhen: string): Promise<DynamicServerEnv> {
   return checkEnvExists(calledWhen);
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function routeData() {
    checkEnvExists("routeData for Home");
    const cfg = useServerEnvironment("routeData useServerEnvironment call");

    return createRouteData(() => {
        const x = getRandomInt(1, 10000);
        return `DATA!!!! ${cfg.get("SOME_VALUE")} ${x}`;
    });
}

export default function Home() {
    const cfg = useServerEnvironment("Home useServerEnvironment call");

    checkEnvExists("Home inline call");

    const data = useRouteData<typeof routeData>();

    console.log("Home routeData: ", data.loading, data.state, JSON.stringify(data()));

    onMount(() => {
        console.log("Home routeData from sync onMount: ", data.loading, data.state, JSON.stringify(data()));
        checkEnvExists("sync onMount");
    });

    onMount(async () => {
        console.log("Home routeData from sync onMount: ", data.loading, data.state, JSON.stringify(data()));
        checkEnvExists("async onMount");
        await asyncCheckEnvExists("async onMount via asyncCheckEnvExists");
    });

    // and server$ calls should work too!
    onMount(async () => {
        const serverFunc = server$(() => {
            const cfg = useServerEnvironment("server$ func!");
            const value = cfg.get("VITE_SOME_VALUE")
            console.log("server-side value ", value);
            return value
        });
        const value = await serverFunc();
        console.log("server$ function returned ", value);
    })

    async function emptyAsync() {}

    createEffect(() => {
        checkEnvExists("sync effect");
    })

    createEffect(async () => {
        checkEnvExists("async effect");
        await asyncCheckEnvExists("async effect via asyncCheckEnvExists");
    })

    return (
        <main>
            <Title>Hello World</Title>
            <h1>Hello world!</h1>
            <Counter/>
            <p>
                configuration{"  " + cfg.get("VITE_SOME_VALUE") + "  " + cfg.get("VITE_OTHER_VALUE")}
            </p>
            <div><span style={"background-color: #600; color: #FFF"} onClick={() => { refetchRouteData() }}>
                CLICK ME TO REFETCH {data()}
            </span></div>
        </main>
    );
}
