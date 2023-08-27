import {
    createContext, createResource,
    mergeProps,
    ParentComponent,
    Resource,
    useContext
} from "solid-js";
import {isServer} from "solid-js/web";

export type EnvConfigMap = { [key: string]: string };

export const EnvConfigurationContext = createContext<Resource<EnvConfigMap>>();

type EnvConfigurationProps = {
    includeEnvVariables: Boolean,
    envVariablePrefix?: string,
    envVariableList: string[],
    customConfiguration?: EnvConfigMap
}

function loadEnvironment(props: EnvConfigurationProps): EnvConfigMap {
    if (!isServer) return {};

    const settings = mergeProps({
        includeEnvVariables: true,
        envVariablePrefix: "",
        envVariableList: [],
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
        ) as EnvConfigMap
        : {};
    const fromEnvironmentList = (settings.includeEnvVariables && hasEnvNameList)
        ? Object.fromEntries(Object.entries(process.env)
            .filter(([key, value]) => value && filterNames.has(key.trim()))) as EnvConfigMap
        : {};
    return {...settings.customConfiguration, ...fromEnvironmentPrefix, ...fromEnvironmentList};
}

export const SafeServerEnvProvider: ParentComponent<EnvConfigurationProps> = (props) => {
    const [cfgResource] = createResource(() => {
        return loadEnvironment(props)
    });

    return (
        <EnvConfigurationContext.Provider value={cfgResource}>
            {props.children}
        </EnvConfigurationContext.Provider>
    );
}




