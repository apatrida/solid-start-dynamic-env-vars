import {
    createContext, createResource,
    mergeProps,
    ParentComponent,
    Resource,
    useContext
} from "solid-js";
import {isServer} from "solid-js/web";

export type EnvConfigMap = { [key: string]: string };

export type EnvConfigurationProps = {
    includeEnvVariables: Boolean,
    envVariablePrefix?: string,
    envVariableList: string[],
    stripPrefix: Boolean,
    customConfiguration?: EnvConfigMap
}

const EnvConfigurationContext = createContext<Resource<EnvConfigMap>>();

export function loadEnvironment(props: EnvConfigurationProps): EnvConfigMap {
    if (!isServer) return {};

    console.log("Loading ENV on server");

    const settings = mergeProps({
        includeEnvVariables: true,
        envVariablePrefix: "",
        envVariableList: [],
        stripPrefix: false,
        customConfiguration: {}
    } satisfies EnvConfigurationProps, props);

    const filterPrefix = settings.envVariablePrefix.trim();
    const hasEnvPrefix = filterPrefix.length > 0;
    const filterNames = new Set(settings.envVariableList.map(v => v.trim()).filter(v => v.trim().length > 0));
    const hasEnvNameList = filterNames.size > 0;

    if (settings.includeEnvVariables
        && !hasEnvPrefix
        && !hasEnvNameList) {
        throw Error("To include server environment variables, you must specify a prefix or a list of environment variables");
    }

    const fromEnvironmentPrefix = (settings.includeEnvVariables && hasEnvPrefix)
        ? Object.fromEntries(Object.entries(process.env)
            .filter(([key, value]) => key.startsWith(filterPrefix) && value)
            .map(([key, value]) => settings.stripPrefix ? [key.slice(filterPrefix.length), value] : [key, value])
        ) as EnvConfigMap
        : {};
    const fromEnvironmentList = (settings.includeEnvVariables && hasEnvNameList)
        ? Object.fromEntries(Object.entries(process.env)
            .filter(([key, value]) => value && filterNames.has(key.trim()))) as EnvConfigMap
        : {};
    const combinedConfig = {...settings.customConfiguration, ...fromEnvironmentPrefix, ...fromEnvironmentList};

    return combinedConfig;
}

export const DynamicServerEnvProvider: ParentComponent<EnvConfigurationProps> = (props) => {
    const [cfgResource] = createResource(() => {
        return loadEnvironment(props)
    });

    return (
        <EnvConfigurationContext.Provider value={cfgResource}>
            {props.children}
        </EnvConfigurationContext.Provider>
    );
}

export interface DynamicServerEnv {
    get(key: string): string | undefined
}

// work both within the component stack and a provider, or the global signal otherwise.  Although the global signal
// will be empty if the context provider isn't in the component stack somewhere.
export default function useServerEnvironment(testLabel: string): EnvConfigMap {
    console.log(`useServerEnvironment( ${testLabel} )`);
    const cfg = useContext(EnvConfigurationContext);
    console.log(`  useContext    `, JSON.stringify(cfg?.()));
    return cfg?.() || {} as EnvConfigMap;
}


