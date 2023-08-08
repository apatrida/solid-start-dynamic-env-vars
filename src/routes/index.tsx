import {Title, useRouteData, createRouteData} from "solid-start";
import { refetchRouteData } from 'solid-start';
import Counter from "~/components/Counter";
import useServerEnvironment, {EnvConfigMap} from "~/lib/EnvConfiguration";
import {createEffect, onMount} from "solid-js";

function checkEnvExists(calledWhen: string): EnvConfigMap {
   return useServerEnvironment(calledWhen)!;
}

async function asyncCheckEnvExists(calledWhen: string): Promise<EnvConfigMap> {
   return checkEnvExists(calledWhen);
}

export function routeData() {
    return createRouteData(() => {
        checkEnvExists("routeData for Home");
        const cfg = useServerEnvironment("routeData useServerEnvironment call");
        return `DATA!!!! ${cfg["SOME_VALUE"]}`;
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
                configuration{"  " + cfg["SOME_VALUE"] + "  " + cfg["OTHER_VALUE"]}
            </p>
            <p onClick={() => { refetchRouteData() }}>
                CLICK ME TO REFETCH {data()}
            </p>
            <br/>
            <pre><code>{JSON.stringify(cfg)}</code></pre>
        </main>
    );
}
