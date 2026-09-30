"""Create all narration locally with Kokoro; students download only the MP3s."""
import json
import pathlib
import subprocess
import time
import argparse
import numpy as np
import soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro

root = pathlib.Path(__file__).resolve().parents[1]
work = root / 'output/audio'
destination = root / 'assets/narration'
destination.mkdir(parents=True, exist_ok=True)
entries = [entry for batch in json.loads((work / 'batches/requests.json').read_text()) for entry in batch['entries']]
parser = argparse.ArgumentParser()
parser.add_argument('--ids', nargs='+', help='Regenerate specific clips while preserving the others')
args = parser.parse_args()
if args.ids:
    entries = [entry for entry in entries if entry['id'] in args.ids]
options = ort.SessionOptions()
options.intra_op_num_threads = 4
options.inter_op_num_threads = 1
ort.disable_telemetry_events()
session = ort.InferenceSession(str(work / 'kokoro-v1.0.int8.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
kokoro = Kokoro.from_session(session, str(work / 'voices-v1.0.bin'))
voice = 'af_heart'
manifest = {}
if args.ids:
    saved = (destination / 'manifest.js').read_text().split('export const NARRATION_AUDIO = ', 1)[1].rsplit(';', 1)[0]
    manifest = json.loads(saved)
started = time.monotonic()

for index, entry in enumerate(entries):
    wave = work / f'{entry["id"]}-heart.wav'
    samples, sample_rate = kokoro.create(entry['spoken'], voice=voice, speed=1.0, lang='en-us')
    if len(samples) < sample_rate * 0.3 or not np.isfinite(samples).all() or np.max(np.abs(samples)) < 0.005:
        raise ValueError(f'{entry["id"]}: invalid or silent generated audio')
    # Leave a little breathing room without slowing down or shifting the voice.
    samples = np.concatenate([np.zeros(int(sample_rate * 0.08)), samples, np.zeros(int(sample_rate * 0.16))])
    sf.write(str(wave), samples, sample_rate)
    filename = f'{entry["id"]}.mp3'
    subprocess.run([
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wave),
        '-af', 'loudnorm=I=-18:TP=-2:LRA=7', '-ar', '44100', '-ac', '1',
        '-codec:a', 'libmp3lame', '-b:a', '96k', str(destination / filename)
    ], check=True)
    duration = float(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', str(destination / filename)
    ]))
    manifest[entry['id']] = {'src': f'assets/narration/{filename}', 'duration': round(duration, 3), 'text': entry['text']}
    # Keep a recoverable manifest while recording the remaining lines.
    output = '// Generated locally with Kokoro af_heart; scripts are checked by tests.\n'
    output += 'export const NARRATOR = "Heart · Storyteller";\n'
    output += 'export const NARRATION_AUDIO = ' + json.dumps(manifest, ensure_ascii=False, indent=2) + ';\n'
    temporary = destination / 'manifest.tmp'
    temporary.write_text(output)
    temporary.replace(destination / 'manifest.js')
    print(f'{index + 1}/{len(entries)} {entry["id"]}: {duration:.1f}s audio, {time.monotonic() - started:.1f}s elapsed', flush=True)

print(f'Finished {len(manifest)} recordings: {sum(c["duration"] for c in manifest.values()):.1f} seconds of audio.', flush=True)
