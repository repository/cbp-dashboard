import superjson from "superjson";
import type { LocalStorageOptions } from "use-local-storage-state";
import useLocalStorageState from "use-local-storage-state";
import type { RuntimeLog, Team } from "~/processing";

export const serializer: NonNullable<LocalStorageOptions<unknown>["serializer"]> = {
  stringify: superjson.stringify,
  parse: superjson.parse,
};

export const useLSTeams = () => useLocalStorageState<Team[]>("teams_v2", { defaultValue: [], serializer });
export const useLSRuntimeLog = () =>
  useLocalStorageState<RuntimeLog>("runtimeLog_v2", { defaultValue: {}, serializer });
