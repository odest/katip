use once_cell::sync::Lazy;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Listener, State};
use tokio::sync::Mutex as TokioMutex;
use crate::audio_utils;

#[cfg(not(target_os = "android"))]
use whisper_rs::{
    FullParams, SamplingStrategy, SegmentCallbackData, WhisperContext, WhisperContextParameters,
};

#[cfg(not(target_os = "android"))]
pub struct TranscriptionState(pub Arc<TokioMutex<Option<WhisperContext>>>);

#[cfg(target_os = "android")]
pub struct TranscriptionState(pub Arc<TokioMutex<Option<()>>>);

static PROCESSED_AUDIO: Lazy<Mutex<Option<Vec<f32>>>> = Lazy::new(|| Mutex::new(None));

static CANCEL_FLAG: Lazy<Arc<AtomicBool>> = Lazy::new(|| Arc::new(AtomicBool::new(false)));
static PROGRESS_CALLBACK: Lazy<Mutex<Option<Box<dyn Fn(i32) + Send + Sync>>>> =
    Lazy::new(|| Mutex::new(None));
static NEW_SEGMENT_CALLBACK: Lazy<Mutex<Option<Box<dyn Fn(SegmentPayload) + Send + Sync>>>> =
    Lazy::new(|| Mutex::new(None));

#[derive(serde::Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TranscriptionOptions {
    pub language: String,
    pub translate: bool,
    pub thread_count: i32,
    pub strategy: String,
    pub best_of: i32,
    pub beam_size: i32,
    pub temperature: f32,
    pub initial_prompt: String,
    pub patience: f32,
    pub split_on_word: bool,
    pub suppress_blank: bool,
    pub suppress_non_speech_tokens: bool,
    pub token_timestamps: bool,
    pub max_length: i32,
}

#[derive(Clone, serde::Serialize)]
struct ProgressPayload {
    progress: i32,
}

#[derive(Clone, serde::Serialize)]
struct SegmentPayload {
    start: i64,
    end: i64,
    text: String,
}

#[cfg(not(target_os = "android"))]
#[tauri::command]
pub async fn process_audio(audio_path: String) -> Result<(), String> {
    let audio_data = audio_utils::decode_and_resample(&audio_path)
        .map_err(|e| format!("Audio processing error: {}", e))?;

    let mut processed = PROCESSED_AUDIO.lock().unwrap();
    *processed = Some(audio_data);

    Ok(())
}

#[cfg(target_os = "android")]
#[tauri::command]
pub async fn process_audio(_audio_path: String) -> Result<(), String> {
    Err("Not supported on Android".to_string())
}

#[cfg(not(target_os = "android"))]
#[tauri::command]
pub async fn load_model(
    model_path: String,
    use_gpu: bool,
    gpu_device: Option<i32>,
    state: State<'_, TranscriptionState>,
) -> Result<(), String> {
    let mut ctx_params = WhisperContextParameters::default();
    ctx_params.use_gpu = use_gpu;
    ctx_params.gpu_device = gpu_device.unwrap_or(0);

    let ctx = WhisperContext::new_with_params(&model_path, ctx_params)
        .map_err(|e| format!("Failed to load model: {:?}", e))?;

    let mut context = state.0.lock().await;
    *context = Some(ctx);

    Ok(())
}

#[cfg(target_os = "android")]
#[tauri::command]
pub async fn load_model(
    _model_path: String,
    _use_gpu: bool,
    _gpu_device: Option<i32>,
    _state: State<'_, TranscriptionState>,
) -> Result<(), String> {
    Err("Not supported on Android".to_string())
}

#[cfg(not(target_os = "android"))]
#[tauri::command]
pub async fn transcribe(
    options: TranscriptionOptions,
    app_handle: AppHandle,
    state: State<'_, TranscriptionState>,
) -> Result<(), String> {
    CANCEL_FLAG.store(false, Ordering::SeqCst);

    let app_handle_cloned = app_handle.clone();
    let context_arc_cloned = state.0.clone();
    let abort_atomic = CANCEL_FLAG.clone();

    app_handle.listen("abort_transcribe", move |_| {
        abort_atomic.store(true, Ordering::SeqCst);
    });

    tokio::spawn(async move {
        let context_guard = context_arc_cloned.lock().await;
        let context = context_guard
            .as_ref()
            .ok_or("Model not loaded. Please load a model first.")
            .map_err(|e| {
                app_handle_cloned
                    .emit("transcribe_error", e.to_string())
                    .unwrap();
                e.to_string()
            })?;

        let mut whisper_state = context.create_state().map_err(|e| {
            app_handle_cloned
                .emit(
                    "transcribe_error",
                    format!("Failed to create state: {:?}", e),
                )
                .unwrap();
            format!("Failed to create state: {:?}", e)
        })?;

        let mut params = match options.strategy.as_str() {
            "beamSearch" => FullParams::new(SamplingStrategy::BeamSearch {
                beam_size: options.beam_size,
                patience: options.patience,
            }),
            _ => FullParams::new(SamplingStrategy::Greedy {
                best_of: options.best_of,
            }),
        };

        if options.language != "auto" {
            params.set_language(Some(&options.language));
        }
        params.set_translate(options.translate);
        params.set_n_threads(options.thread_count);
        params.set_temperature(options.temperature);
        params.set_initial_prompt(&options.initial_prompt.clone());
        params.set_split_on_word(options.split_on_word);
        params.set_suppress_blank(options.suppress_blank);
        params.set_suppress_non_speech_tokens(options.suppress_non_speech_tokens);
        params.set_token_timestamps(options.token_timestamps);
        if options.max_length > 0 {
            params.set_max_len(options.max_length);
        }
        params.set_print_progress(false);
        params.set_print_realtime(false);

        let app_handle_progress = app_handle_cloned.clone();
        let progress_closure = move |progress: i32| {
            app_handle_progress
                .emit("transcribe_progress", ProgressPayload { progress })
                .unwrap();
        };
        *PROGRESS_CALLBACK.lock().unwrap() = Some(Box::new(progress_closure));

        params.set_progress_callback_safe(|progress| {
            if let Some(callback) = PROGRESS_CALLBACK.lock().unwrap().as_ref() {
                callback(progress);
            }
        });

        let app_handle_segment = app_handle_cloned.clone();
        let new_segment_closure = move |segment_data: SegmentPayload| {
            app_handle_segment
                .emit("new_segment", segment_data)
                .unwrap();
        };
        *NEW_SEGMENT_CALLBACK.lock().unwrap() = Some(Box::new(new_segment_closure));

        params.set_segment_callback_safe_lossy(|segment_data_from_whisper: SegmentCallbackData| {
            if let Some(callback) = NEW_SEGMENT_CALLBACK.lock().unwrap().as_ref() {
                callback(SegmentPayload {
                    start: segment_data_from_whisper.start_timestamp,
                    end: segment_data_from_whisper.end_timestamp,
                    text: segment_data_from_whisper.text,
                });
            }
        });

        params.set_abort_callback_safe(|| CANCEL_FLAG.load(Ordering::SeqCst));

        let audio_data = {
            let mut processed = PROCESSED_AUDIO.lock().unwrap();
            processed.take()
        };

        let audio_data = match audio_data {
            Some(data) => data,
            None => {
                app_handle_cloned
                    .emit("transcribe_error", "Audio data not found. process_audio must be called first.".to_string())
                    .unwrap();
                return Ok::<(), String>(());
            }
        };

        match whisper_state.full(params, &audio_data) {
            Ok(_) => {
                if CANCEL_FLAG.load(Ordering::SeqCst) {
                    app_handle_cloned.emit("transcribe_cancelled", ()).unwrap();
                } else {
                    app_handle_cloned.emit("transcribe_completed", ()).unwrap();
                }
            }
            Err(e) => {
                if CANCEL_FLAG.load(Ordering::SeqCst) {
                    app_handle_cloned.emit("transcribe_cancelled", ()).unwrap();
                } else {
                    app_handle_cloned
                        .emit("transcribe_error", format!("Transcription failed: {:?}", e))
                        .unwrap();
                }
            }
        }
        Ok::<(), String>(())
    });

    Ok(())
}

#[cfg(target_os = "android")]
#[tauri::command]
pub async fn transcribe(
    _options: TranscriptionOptions,
    _app_handle: AppHandle,
    _state: State<'_, TranscriptionState>,
) -> Result<(), String> {
    Err("Not supported on Android".to_string())
}

#[cfg(not(target_os = "android"))]
#[tauri::command]
pub async fn cancel_transcription(app_handle: AppHandle) -> Result<(), String> {
    app_handle
        .emit("abort_transcribe", ())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(target_os = "android")]
#[tauri::command]
pub async fn cancel_transcription(_app_handle: AppHandle) -> Result<(), String> {
    Err("Not supported on Android".to_string())
}
