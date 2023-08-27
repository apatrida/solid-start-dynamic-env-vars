import {Resource, useContext} from "solid-js";
import {isServer} from "solid-js/web";
import {EnvConfigMap, EnvConfigurationContext} from "./SafeServerEnv";

export interface DynamicServerEnv {
    getRequired(key: string): string
    getOptional(key: string, defaultValue?: string): string | undefined
}

export function useServerEnv$(): DynamicServerEnv {
    if (isServer) {
        return {
            getOptional(key: string, defaultValue?: string): string | undefined {
                const value = process.env[key] || defaultValue;
                if (value?.trim() === '') return undefined;
                return value;
            },
            getRequired(key: string): string {
                const value = this.getOptional(key);
                if (!value) {
                    throw Error(`Attempt to access MISSING unsafe server env key ${key} from server.`);
                }
                return value;
            }
        };
    } else {
        throw Error("Cannot access useServerEnv$ from client");
    }
}

export function useServerEnvFromClient(cfg: Resource<EnvConfigMap>|undefined = useContext(EnvConfigurationContext)): DynamicServerEnv {
    if (!cfg) {
        throw Error("Cannot access useServerEnvFromClient if not under a context provider for the server configuration");
    }
    return {
        getOptional(key: string, defaultValue?: string): string | undefined {
            const availableConfig = (cfg?.() || {} as EnvConfigMap);
            const value = availableConfig[key] || defaultValue;
            if (value?.trim() === '') return undefined;
            return value;
        },
        getRequired(key: string): string {
            const value = this.getOptional(key);
            if (!value) {
                throw Error(`Attempt to access MISSING unsafe server env key ${key} from client.`);
            }
            return value;
        }
    };
}

export function useSafeServerEnv(): DynamicServerEnv {
    const cfg = useContext(EnvConfigurationContext);

    // sometimes you are on the server, but the limited configuration is available.  This indicates that we are
    // within the same component tree as the provider, and likely server-side rendering. Therefore we should not
    // access anything not intended for the client.

    if (isServer && !cfg) { // !cfg ensures we are not in the rendering tree
        return useServerEnv$();
    } else {
        return useServerEnvFromClient(cfg);
    }
}
