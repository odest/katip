use std::fs::{self, File};
use std::path::Path;
use symphonia::core::audio::AudioBufferRef;
use symphonia::core::audio::Signal;
use symphonia::core::codecs::{DecoderOptions, CODEC_TYPE_NULL};
use symphonia::core::errors::Error;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;

use rubato::{FastFixedIn, PolynomialDegree, Resampler};

pub fn decode(path: &str) -> Result<(Vec<f32>, u32), Box<dyn std::error::Error>> {
    let file_path = Path::new(path);
    let metadata = fs::metadata(file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    let file_size = metadata.len();

    if file_size == 0 {
        return Err("File is empty (0 bytes)".into());
    }

    if file_size < 100 {
        return Err(format!("File is too small ({} bytes), not a valid audio file", file_size).into());
    }

    let src = File::open(file_path)?;
    let mss = MediaSourceStream::new(Box::new(src), Default::default());
    let hint = Hint::new();
    let meta_opts: MetadataOptions = Default::default();
    let fmt_opts: FormatOptions = Default::default();

    let probed = symphonia::default::get_probe()
        .format(&hint, mss, &fmt_opts, &meta_opts)
        .map_err(|e| format!("Failed to detect audio format: {:?}", e))?;

    let mut format = probed.format;

    let track = format
        .tracks()
        .iter()
        .find(|t| t.codec_params.codec != CODEC_TYPE_NULL)
        .ok_or("No audio track found in file")?;

    let dec_opts: DecoderOptions = Default::default();
    let mut decoder = symphonia::default::get_codecs()
        .make(&track.codec_params, &dec_opts)
        .map_err(|e| format!("Failed to create decoder: {:?}", e))?;

    let track_id = track.id;
    let source_sample_rate = track.codec_params.sample_rate.unwrap_or(44100);

    let mut all_samples: Vec<f32> = Vec::new();
    let mut error_count = 0;
    let max_consecutive_errors = 50;

    loop {
        let packet = match format.next_packet() {
            Ok(packet) => packet,
            Err(Error::IoError(_)) => break,
            Err(Error::ResetRequired) => continue,
            Err(err) => return Err(Box::new(err)),
        };

        if packet.track_id() != track_id {
            continue;
        }

        match decoder.decode(&packet) {
            Ok(decoded) => {
                match decoded {
                    AudioBufferRef::F32(buf) => {
                        for i in 0..buf.frames() {
                            let mut mixed_sample = 0.0;
                            for c in 0..buf.spec().channels.count() {
                                mixed_sample += buf.chan(c)[i];
                            }
                            mixed_sample /= buf.spec().channels.count() as f32;
                            all_samples.push(mixed_sample);
                        }
                    }
                    _ => {
                        let spec = *decoded.spec();
                        let channels = spec.channels.count();
                        let mut sample_buf =
                            symphonia::core::audio::SampleBuffer::<f32>::new(decoded.capacity() as u64, spec);
                        sample_buf.copy_interleaved_ref(decoded);
                        let samples = sample_buf.samples();

                        for frame in samples.chunks(channels) {
                            let mut mixed_sample = 0.0;
                            for &sample in frame {
                                mixed_sample += sample;
                            }
                            mixed_sample /= channels as f32;
                            all_samples.push(mixed_sample);
                        }
                    }
                }
            }
            Err(Error::IoError(_)) => break,
            Err(Error::DecodeError(_)) => {
                error_count += 1;
                if error_count >= max_consecutive_errors {
                    return Err(format!("Too many decode errors ({}), file may be corrupted", error_count).into());
                }
                continue;
            }
            Err(err) => return Err(Box::new(err)),
        }
        error_count = 0;
    }

    if all_samples.is_empty() {
        return Err("Failed to read audio data from file, file may be empty or corrupted".into());
    }

    Ok((all_samples, source_sample_rate))
}

pub fn resample(
    input_data: Vec<f32>,
    source_rate: u32,
    target_rate: u32,
) -> Result<Vec<f32>, Box<dyn std::error::Error>> {
    if source_rate == target_rate {
        return Ok(input_data);
    }

    let channels = 1;
    let chunk_size = 1024;
    let ratio = target_rate as f64 / source_rate as f64;

    let mut resampler = FastFixedIn::<f32>::new(
        ratio,
        1.0,
        PolynomialDegree::Septic,
        chunk_size,
        channels,
    )?;

    let expected_output_len = (input_data.len() as f64 * ratio).ceil() as usize;
    let mut resampled_data = Vec::with_capacity(expected_output_len + chunk_size);

    let mut padded_input = input_data;
    let remainder = padded_input.len() % chunk_size;
    if remainder != 0 {
        let padding_needed = chunk_size - remainder;
        padded_input.extend(std::iter::repeat(0.0f32).take(padding_needed));
    }

    for chunk in padded_input.chunks_exact(chunk_size) {
        let input_frames: Vec<&[f32]> = vec![chunk];
        let output = resampler.process(&input_frames, None)?;
        resampled_data.extend_from_slice(&output[0]);
    }

    resampled_data.truncate(expected_output_len);

    Ok(resampled_data)
}

pub fn decode_and_resample(path: &str) -> Result<Vec<f32>, Box<dyn std::error::Error>> {
    let (decoded_data, source_rate) = decode(path)?;
    let target_rate = 16000;
    let result = resample(decoded_data, source_rate, target_rate)?;
    Ok(result)
}
