import {Resource, useContext} from "solid-js";
import {isServer} from "solid-js/web";
import {EnvConfigMap, EnvConfigurationContext} from "./SafeServerEnv";

export interface DynamicServerEnv {
    getRequired(key: string): string

    getOptional(key: string, defaultValue?: string): string | undefined
}

export function useServerEnv$(): DynamicServerEnv {
    if (!isServer) {
        throw Error("Cannot access useServerEnv$ from client");
    }
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
}

export function useServerEnvFromContext(cfg: Resource<EnvConfigMap> | undefined = useContext(EnvConfigurationContext)): DynamicServerEnv {
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
    // This method is less safe as we could end up with server environment during SSR in places you want the limited
    // environment, so this checks that if the provided context version is available use it always before allowing
    // direct server access to process.env, EVEN when on the server.  It is probably better to use one of the versions
    // above to assert the intent.

    const cfg = useContext(EnvConfigurationContext);

    if (isServer && !cfg) { // !cfg ensures we are not in the rendering tree
        return useServerEnv$();
    } else {
        return useServerEnvFromContext(cfg);
    }
}
