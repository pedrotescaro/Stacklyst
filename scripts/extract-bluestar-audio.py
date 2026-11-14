"""Recover selected embedded sounds from the user-supplied GameMaker data.win.

Usage: python scripts/extract-bluestar-audio.py --source PATH --ffmpeg PATH
The archive is read as data; the game's executable is never run.
"""

import argparse
import hashlib
import io
import json
from pathlib import Path
import struct
import subprocess
import tempfile
import wave
import zipfile


SOUNDS = {
    "musica_muito_balaco_baco": "world.mp3",
    "boss_ta_legal": "boss.mp3",
    "game_over": "defeat.mp3",
    "Explosion17": "encounter.mp3",
    "Blip_Select35": "select.mp3",
    "Laser_Shoot27": "attack.mp3",
    "hit0": "hit.mp3",
    "Hit_Hurt": "hurt.mp3",
    "Powerup": "heal.mp3",
    "levelup": "victory.mp3",
    "Powerup33": "flee.mp3",
    "Laser_Shoot21": "volley.mp3",
    "voice1": "talk.mp3",
}


def extract(source: Path, ffmpeg: str, output: Path) -> None:
    with zipfile.ZipFile(source) as archive:
        data = archive.read("data.win")
    if data[:4] != b"FORM" or struct.unpack_from("<I", data, 4)[0] + 8 != len(data):
        raise ValueError("Invalid GameMaker FORM envelope")

    def uint(offset: int) -> int:
        return struct.unpack_from("<I", data, offset)[0]

    def string(offset: int) -> str:
        return data[offset : data.index(b"\0", offset)].decode("utf-8")

    chunks = {}
    position = 8
    while position < len(data):
        size = uint(position + 4)
        if position + size + 8 > len(data):
            raise ValueError("Truncated GameMaker chunk")
        chunks[data[position : position + 4].decode("ascii")] = position + 8
        position += 8 + size

    sounds, audio = chunks["SOND"], chunks["AUDO"]
    recovered = []
    output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="bluestar-audio-") as temporary:
        for index in range(uint(sounds)):
            entry = uint(sounds + 4 + index * 4)
            name = string(uint(entry))
            if name not in SOUNDS:
                continue
            # SOND records end in audio-group and embedded AUDO index.
            group, audio_index = uint(entry + 28), uint(entry + 32)
            if group != 0 or audio_index >= uint(audio):
                raise ValueError(f"Unexpected audio group/index for {name}")
            embedded = uint(audio + 4 + audio_index * 4)
            original = data[embedded + 4 : embedded + 4 + uint(embedded)]
            if original[:4] != b"RIFF" or original[8:12] != b"WAVE":
                raise ValueError(f"Expected embedded WAV: {name}")
            with wave.open(io.BytesIO(original)) as sample:
                duration = sample.getnframes() / sample.getframerate()
                channels = sample.getnchannels()
            wav_path = Path(temporary, f"{name}.wav")
            wav_path.write_bytes(original)
            destination = output / SOUNDS[name]
            subprocess.run(
                [ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav_path),
                 "-map_metadata", "-1", "-codec:a", "libmp3lame", "-b:a",
                 "128k" if duration > 10 else "96k", str(destination)],
                check=True,
            )
            encoded = destination.read_bytes()
            recovered.append({
                "name": name,
                "file": SOUNDS[name],
                "soundIndex": index,
                "audioIndex": audio_index,
                "embeddedOffset": embedded,
                "originalSha256": hashlib.sha256(original).hexdigest(),
                "sha256": hashlib.sha256(encoded).hexdigest(),
                "durationSeconds": round(duration, 6),
                "channels": channels,
                "originalBytes": len(original),
                "bytes": len(encoded),
            })
    if len(recovered) != len(SOUNDS):
        raise ValueError("One or more expected Blue Star sounds were not found")
    manifest = {
        "sourceArchive": source.name,
        "sourceArchiveSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "sourceDataSha256": hashlib.sha256(data).hexdigest(),
        "format": "GameMaker FORM / SOND -> AUDO / embedded PCM WAV -> MP3",
        "encoding": "libmp3lame, 128 kb/s music and 96 kb/s effects; original channels/sample rate",
        "assets": sorted(recovered, key=lambda item: item["file"]),
    }
    (output / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Recovered {len(recovered)} sounds, {sum(a['bytes'] for a in recovered):,} bytes")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--ffmpeg", default="ffmpeg")
    parser.add_argument("--output", type=Path, default=Path("public/assets/mundinho/audio"))
    arguments = parser.parse_args()
    extract(arguments.source, arguments.ffmpeg, arguments.output)
