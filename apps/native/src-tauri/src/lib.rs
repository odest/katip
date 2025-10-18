// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}! You've been greeted from Tauri!", name)
}

#[derive(Clone, serde::Serialize)]
struct TranscriptionSegment {
  start_time: i64,
  end_time: i64,
  text: String,
}

// Desktop platforms: Full whisper-rs implementation
#[cfg(not(target_os = "android"))]
#[tauri::command]
async fn transcribe_audio(
  audio_path: String,
  model_path: String,
) -> Result<Vec<TranscriptionSegment>, String> {
  use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

  // Load audio file
  let mut reader =
    hound::WavReader::open(&audio_path).map_err(|e| format!("Failed to open audio file: {}", e))?;

  // Convert audio to f32 samples
  let audio_data: Vec<f32> = reader
    .samples::<i16>()
    .map(|s| s.unwrap_or(0) as f32 / i16::MAX as f32)
    .collect();

  // Load Whisper model
  let ctx = WhisperContext::new_with_params(&model_path, WhisperContextParameters::default())
    .map_err(|e| format!("Failed to load model: {:?}", e))?;

  // Create state
  let mut state = ctx
    .create_state()
    .map_err(|e| format!("Failed to create state: {:?}", e))?;

  // Configure transcription parameters
  let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
  params.set_print_progress(false);
  params.set_print_realtime(false);
  params.set_translate(false);

  // Run transcription
  state
    .full(params, &audio_data)
    .map_err(|e| format!("Transcription failed: {:?}", e))?;

  // Extract segments
  let num_segments = state.full_n_segments();

  let mut segments = Vec::new();
  for i in 0..num_segments {
    if let Some(segment) = state.get_segment(i) {
      let segment_text = segment
        .to_str()
        .map_err(|e| format!("Failed to get segment text: {:?}", e))?;
      let start_time = segment.start_timestamp();
      let end_time = segment.end_timestamp();

      segments.push(TranscriptionSegment {
        start_time, // Already in centiseconds (10ms units)
        end_time,
        text: segment_text.to_string(),
      });
    }
  }

  Ok(segments)
}

// Android: Stub implementation (feature not yet available)
#[cfg(target_os = "android")]
#[tauri::command]
async fn transcribe_audio(
  _audio_path: String,
  _model_path: String,
) -> Result<Vec<TranscriptionSegment>, String> {
  Err("Speech-to-text transcription is not yet available on Android. This feature is currently only supported on desktop platforms (Windows, macOS, Linux).".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![greet, transcribe_audio])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
