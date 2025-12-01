import { isTauri } from "@tauri-apps/api/core";
import { clientDb } from "@workspace/ui/db/client";
import { nativeDb } from "@workspace/ui/db/native";

export const database = isTauri() ? nativeDb : clientDb;
