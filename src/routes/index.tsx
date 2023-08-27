import {Title, useRouteData, createRouteData} from "solid-start";
import { refetchRouteData } from 'solid-start';
import Counter from "~/components/Counter";
import {createEffect, onMount} from "solid-js";
import server$ from 'solid-start/server';
import {useSafeServerEnv} from "~/lib/useSafeServerEnv";

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

export function routeData() {
    // important this is called here and captured here, as the nested function will not be able to reliably
    // get the context in some cases (such as during refetchRouteData)
    const cfg = useSafeServerEnv();

    return createRouteData(() => {
        const x = getRandomInt(1, 10000);
        return `DATA!!!! ${cfg.getOptional("SOME_VALUE")} ${x}`;
    });
}

export default function Home() {
    const data = useRouteData<typeof routeData>();

    onMount(() => {
        const cfg = useSafeServerEnv();
        console.log("In onMount, value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
        console.log("in onMount, value of `USER`: ", cfg.getRequired("USER"));
    });

    onMount(async () => {
        const cfg = useSafeServerEnv();
        console.log("In onMount async, value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
        console.log("in onMount async, value of `USER`: ", cfg.getRequired("USER"));
    });

    // and server$ calls should work too!
    onMount(async () => {
        const serverFunc = server$(() => {
            const cfg = useSafeServerEnv();
            console.log("In server$ call, value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
            console.log("In server$ call, value of `USER`: ", cfg.getRequired("USER"));
            return cfg.getRequired("SOMETHING");
        });
        const value = await serverFunc();
        console.log("server$ function returned contents of env var `SOMETHING`", value);
    });

    createEffect(() => {
        const cfg = useSafeServerEnv();
        console.log("In createEffect, value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
        console.log("in createEffect, value of `USER`: ", cfg.getRequired("USER"));
    });

    createEffect(async () => {
        console.log("In createEffect async, value of `VITE_SOME_VALUE`: ", cfg.getRequired("VITE_SOME_VALUE"));
        console.log("in createEffect async, value of `USER`: ", cfg.getRequired("USER"));
    })

    const cfg = useSafeServerEnv();

    return (
        <main>
            <Title>Hello World</Title>
            <h1>Hello world!</h1>
            <Counter/>
            <p>
                Configuration:
            </p>
            <ul>
                <li>VITE_SOME_VALUE: {cfg.getRequired("VITE_SOME_VALUE")}</li>
                <li>VITE_OTHER_VALUE: {cfg.getRequired("VITE_OTHER_VALUE")}</li>
                <li>SOMETHING: {cfg.getRequired("SOMETHING")}</li>
                <li>WHATEVER: {cfg.getRequired("WHATEVER")}</li>
                <li>USER: {cfg.getRequired("USER")}</li>
                <li>SHELL: {cfg.getOptional("SHELL")} (<i>should not be returned, not in whitelist</i>)</li>
                <li>HOME: {cfg.getOptional("HOME")} (<i>should not be returned, not in whitelist</i>)</li>
            </ul>
            {/* important that refretch does not lose the context of the env variables */}
            <div><span style={"background-color: #600; color: #FFF"} onClick={() => { refetchRouteData() }}>
                CLICK ME TO REFETCH {data()} (should not break counter or other state)
            </span></div>

        </main>
    );
}
