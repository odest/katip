// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod transcription;

use std::sync::Arc;
use tokio::sync::Mutex;
use transcription::TranscriptionState;

#[tauri::command]
async fn add_fs_scope(app: tauri::AppHandle, path: String) -> Result<(), String> {
    use tauri_plugin_fs::FsExt;

    let scope = app.fs_scope();
    scope
    .allow_directory(&path, true)
    .map_err(|e| format!("Failed to add path to scope: {}", e))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(TranscriptionState(Arc::new(Mutex::new(None))))
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            add_fs_scope,
            transcription::load_model,
            transcription::transcribe,
            transcription::cancel_transcription
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
