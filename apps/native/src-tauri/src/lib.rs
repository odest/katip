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

  // Configure Whisper context parameters for GPU usage
  let mut ctx_params = WhisperContextParameters::default();
  
  // Enable GPU usage (Vulkan on Windows/Linux)
  ctx_params.use_gpu = true;
  
  #[cfg(all(feature = "vulkan", windows))]
  {
    // Verify Vulkan is available
    if !is_vulkan_available() {
      return Err("Vulkan is not available on this system. Please install Vulkan drivers.".to_string());
    }
  }

  // Load Whisper model with GPU support
  let ctx = WhisperContext::new_with_params(&model_path, ctx_params)
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
  let num_segments = state
    .full_n_segments()
    .map_err(|e| format!("Failed to get segment count: {:?}", e))?;

  let mut segments = Vec::new();
  for i in 0..num_segments {
    let segment_text = state
      .full_get_segment_text(i)
      .map_err(|e| format!("Failed to get segment text: {:?}", e))?;
    let start_time = state
      .full_get_segment_t0(i)
      .map_err(|e| format!("Failed to get segment start time: {:?}", e))?;
    let end_time = state
      .full_get_segment_t1(i)
      .map_err(|e| format!("Failed to get segment end time: {:?}", e))?;

    segments.push(TranscriptionSegment {
      start_time, // Already in centiseconds (10ms units)
      end_time,
      text: segment_text,
    });
  }

  Ok(segments)
}

// Vulkan availability check for Windows
#[cfg(all(feature = "vulkan", windows))]
fn is_vulkan_available() -> bool {
  use ash::vk;
  
  unsafe {
    match ash::Entry::load() {
      Ok(entry) => {
        // Try to create a Vulkan instance to verify it works
        let app_info = vk::ApplicationInfo::default()
          .api_version(vk::make_api_version(0, 1, 0, 0));
        
        let create_info = vk::InstanceCreateInfo::default()
          .application_info(&app_info);
        
        match entry.create_instance(&create_info, None) {
          Ok(instance) => {
            instance.destroy_instance(None);
            true
          }
          Err(_) => false,
        }
      }
      Err(_) => false,
    }
  }
}

#[cfg(not(all(feature = "vulkan", windows)))]
fn is_vulkan_available() -> bool {
  true // Default to true on non-Windows or when Vulkan feature is not enabled
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
