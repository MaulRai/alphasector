import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def verify_all():
    print("=" * 70)
    print("EMPIRICAL MEASUREMENTS: JUDGING SCRIPT, TEASER SCRIPT & TWEETS")
    print("=" * 70)

    # 1. JUDGING SCRIPT
    with open("docs/submission/JUDGING_VIDEO_SCRIPT.md", "r", encoding="utf-8") as f:
        judging_content = f.read()

    seg_pattern = re.compile(
        r"### SEGMEN (\d+):[^\n]+\((\d+:\d+) - (\d+:\d+)\)[\s\S]*?"
        r"\* \*\*Durasi\*\*: (\d+) Detik[\s\S]*?"
        r"#### Narasi Suara \(Verbatim Indonesian Voiceover\):\s*\n([\s\S]*?)"
        r"(?=\n\s*####|\n\s*---)",
        re.MULTILINE
    )
    judging_matches = list(seg_pattern.finditer(judging_content))
    print(f"\n--- 1. JUDGING VIDEO SCRIPT (Found {len(judging_matches)} segments) ---")
    
    j_total_words_re = 0
    j_total_words_split = 0
    j_total_dur = 0
    j_results = []

    for m in judging_matches:
        seg_num = int(m.group(1))
        start = m.group(2)
        end = m.group(3)
        dur = int(m.group(4))
        raw_vo = m.group(5)

        clean_vo = re.sub(r"^[>\s*]+", "", raw_vo, flags=re.MULTILINE)
        clean_vo = clean_vo.replace("*", "").strip()

        words_re = re.findall(r"\b[\w-]+\b", clean_vo)
        words_split = clean_vo.split()

        wpm_re = (len(words_re) / dur) * 60
        wpm_sp = (len(words_split) / dur) * 60

        j_total_words_re += len(words_re)
        j_total_words_split += len(words_split)
        j_total_dur += dur

        is_overloaded = wpm_re > 160.0

        j_results.append({
            "seg": seg_num, "start": start, "end": end, "dur": dur,
            "words_re": len(words_re), "words_sp": len(words_split),
            "wpm_re": wpm_re, "wpm_sp": wpm_sp, "overloaded": is_overloaded,
            "text": clean_vo
        })

        print(f"Segmen {seg_num} [{start} - {end}] ({dur}s): {len(words_re)} words | {wpm_re:.1f} WPM | Overloaded: {is_overloaded}")

    j_avg_wpm = (j_total_words_re / j_total_dur) * 60
    print(f"JUDGING TOTAL: {j_total_words_re} words (regex) / {j_total_words_split} words (split) over {j_total_dur}s")
    print(f"Target: ~430 words over 180s (~140-145 WPM)")
    print(f"Average Pacing: {j_avg_wpm:.1f} WPM")
    print(f"Any segment overloaded (>160 WPM)? {any(r['overloaded'] for r in j_results)}")

    # 2. TEASER SCRIPT
    with open("docs/submission/TEASER_VIDEO_SCRIPT.md", "r", encoding="utf-8") as f:
        teaser_content = f.read()

    scene_pattern = re.compile(
        r"### \[(\d+:\d+) - (\d+:\d+)\] SCENE (\d+):[^\n]+\n"
        r"\* \*\*Durasi\*\*: (\d+) Detik[\s\S]*?"
        r"\* \*\*Voiceover \(VO Indonesia\)\*\*:\s*\n"
        r"\s*>\s*\*\"([\s\S]*?)\"\*",
        re.MULTILINE
    )
    teaser_matches = list(scene_pattern.finditer(teaser_content))
    print(f"\n--- 2. TEASER VIDEO SCRIPT (Found {len(teaser_matches)} scenes) ---")

    t_total_words_re = 0
    t_total_words_split = 0
    t_total_dur = 0
    t_results = []

    for m in teaser_matches:
        start = m.group(1)
        end = m.group(2)
        scene_num = int(m.group(3))
        dur = int(m.group(4))
        raw_vo = m.group(5)

        clean_vo = raw_vo.strip()
        words_re = re.findall(r"\b[\w-]+\b", clean_vo)
        words_split = clean_vo.split()

        wpm_re = (len(words_re) / dur) * 60
        wpm_sp = (len(words_split) / dur) * 60

        t_total_words_re += len(words_re)
        t_total_words_split += len(words_split)
        t_total_dur += dur

        is_overloaded = wpm_re > 175.0

        t_results.append({
            "scene": scene_num, "start": start, "end": end, "dur": dur,
            "words_re": len(words_re), "words_sp": len(words_split),
            "wpm_re": wpm_re, "wpm_sp": wpm_sp, "overloaded": is_overloaded,
            "text": clean_vo
        })

        print(f"Scene {scene_num} [{start} - {end}] ({dur}s): {len(words_re)} words | {wpm_re:.1f} WPM | Overloaded: {is_overloaded}")

    t_avg_wpm = (t_total_words_re / t_total_dur) * 60 if t_total_dur > 0 else 0
    print(f"TEASER TOTAL: {t_total_words_re} words (regex) / {t_total_words_split} words (split) over {t_total_dur}s")
    print(f"Target: ~140 words over 60s (~140-145 WPM)")
    print(f"Average Pacing: {t_avg_wpm:.1f} WPM")
    print(f"Any scene overloaded (>175 WPM)? {any(r['overloaded'] for r in t_results)}")

    # 3. TWEETS IN SUBMISSION_PACKAGE.md
    with open("docs/submission/SUBMISSION_PACKAGE.md", "r", encoding="utf-8") as f:
        pkg_content = f.read()

    tweet_pattern = re.compile(
        r"#### (Tweet \d+ / \d+ [^\n]+)\s*\n```text\n([\s\S]*?)\n```",
        re.MULTILINE
    )
    thread_matches = list(tweet_pattern.finditer(pkg_content))
    print(f"\n--- 3. TWEETS IN SUBMISSION_PACKAGE.md (Found {len(thread_matches)} thread tweets) ---")

    def analyze_tweet(title, text):
        norm = text.replace("\r\n", "\n").strip("\n")
        raw_chars = len(norm)
        
        # Twitter counting rules:
        # URLs count as 23 characters
        urls = re.findall(r'https?://\S+', norm)
        text_sub_url = re.sub(r'https?://\S+', 'X' * 23, norm)
        
        # Twitter weight: code <= 0x10FF is 1, emojis/wide is 2
        tw_weight = 0
        for ch in text_sub_url:
            code = ord(ch)
            if code <= 0x10FF or (0x2000 <= code <= 0x206F):
                tw_weight += 1
            else:
                tw_weight += 2
        
        pass_raw = raw_chars <= 280
        pass_tw = tw_weight <= 280
        status = "PASS" if pass_raw and pass_tw else "FAIL"
        
        print(f"[{title}]")
        print(f"  Raw char length: {raw_chars} chars (Limit: 280) -> {'OK' if pass_raw else 'EXCEEDED (+%d)' % (raw_chars - 280)}")
        print(f"  Twitter-weighted length: {tw_weight} chars -> {'OK' if pass_tw else 'EXCEEDED (+%d)' % (tw_weight - 280)}")
        print(f"  Verdict: {status}")
        return {
            "title": title, "raw": raw_chars, "twitter": tw_weight,
            "pass_raw": pass_raw, "pass_tw": pass_tw, "status": status,
            "text": norm
        }

    tweet_results = []
    for m in thread_matches:
        t_res = analyze_tweet(m.group(1), m.group(2))
        tweet_results.append(t_res)

    single_pattern = re.compile(
        r"### 2\.2 Platform 1 \(Alternative\): X \(formerly Twitter\) — Single Standalone Post[\s\S]*?```text\n([\s\S]*?)\n```",
        re.MULTILINE
    )
    single_match = single_pattern.search(pkg_content)
    if single_match:
        s_res = analyze_tweet("2.2 Single Standalone Post", single_match.group(1))
        tweet_results.append(s_res)

    print("\n" + "=" * 70)
    print("OVERALL COMPLIANCE SUMMARY")
    print("=" * 70)
    print(f"Judging Video Pacing: {'PASS' if not any(r['overloaded'] for r in j_results) else 'FAIL'}")
    print(f"Teaser Video Pacing: {'PASS' if not any(r['overloaded'] for r in t_results) else 'FAIL'}")
    tweet_all_pass = all(t['status'] == 'PASS' for t in tweet_results)
    print(f"Social Media Tweet Lengths (<= 280 chars): {'PASS' if tweet_all_pass else 'FAIL - TWEETS EXCEED 280 CHARACTERS'}")

if __name__ == "__main__":
    verify_all()
