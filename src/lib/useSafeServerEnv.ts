import {useContext} from "solid-js";
import {isServer} from "solid-js/web";
import {EnvConfigMap, EnvConfigurationContext} from "./SafeServerEnv";

export interface DynamicServerEnv {
    getRequired(key: string): string
    getOptional(key: string, defaultValue?: string): string | undefined
}

export function useSafeServerEnv(): DynamicServerEnv {
    const cfg = useContext(EnvConfigurationContext);

    if (isServer && !cfg) { // !cfg important to not return direct server access during component body and rendering
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
        }
    } else {
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
        }
    }
}
