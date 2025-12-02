use sha2::{Digest, Sha256};
use std::fs::File;
use std::io::{BufReader, Read};
use tauri_plugin_fs::FsExt;

#[tauri::command]
pub async fn add_fs_scope(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let scope = app.fs_scope();
    scope
        .allow_directory(&path, true)
        .map_err(|e| format!("Failed to add path to scope: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn calculate_file_hash(path: String) -> Result<String, String> {
    let file = File::open(&path).map_err(|e| format!("Failed to open file: {}", e))?;
    let mut reader = BufReader::new(file);
    let mut hasher = Sha256::new();
    let mut buffer = [0; 8192];

    loop {
        let count = reader
            .read(&mut buffer)
            .map_err(|e| format!("Failed to read file: {}", e))?;
        if count == 0 {
            break;
        }
        hasher.update(&buffer[..count]);
    }

    let result = hasher.finalize();
    Ok(hex::encode(result))
}
