// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod utils;
mod audio_utils;
mod transcription;
mod drizzle_proxy;
include!(concat!(env!("OUT_DIR"), "/generated_migrations.rs"));

use std::sync::Arc;
use tokio::sync::Mutex;
use transcription::TranscriptionState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = load_migrations();
    tauri::Builder::default()
        .manage(TranscriptionState(Arc::new(Mutex::new(None))))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:katip.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            utils::calculate_file_hash,
            transcription::process_audio,
            transcription::load_model,
            transcription::transcribe,
            transcription::cancel_transcription,
            drizzle_proxy::run_sql
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
