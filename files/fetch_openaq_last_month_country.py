#!/usr/bin/env python3
"""
Fetch last 30 days of hourly PM2.5 & PM10 for ALL cities in a country from OpenAQ v3,
then compute US AQI (max of PM2.5/PM10 sub-indices) at the city-hour level.

Requirements:
    pip install requests pandas python-dateutil tqdm

Usage:
    OPENAQ_API_KEY=your_key python fetch_openaq_last_month_country.py --iso IN
"""
import os
import sys
import math
import time
import json
import argparse
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Tuple, Optional, Any, Iterable
import requests
import pandas as pd
from dateutil import parser as dateparser
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

BASE_URL = "https://api.openaq.org/v3"
DEFAULT_PARAMS = {
    "limit": 100,
    "page": 1,
}

# -------------- AQI helpers (US EPA breakpoints) --------------
# Source: US EPA 24-hr breakpoints for PM2.5 and PM10.
PM25_BREAKPOINTS = [
    # (C_lo, C_hi, I_lo, I_hi)
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500),
]

PM10_BREAKPOINTS = [
    (0, 54, 0, 50),
    (55, 154, 51, 100),
    (155, 254, 101, 150),
    (255, 354, 151, 200),
    (355, 424, 201, 300),
    (425, 504, 301, 400),
    (505, 604, 401, 500),
]

def _linear_aqi(c: float, bps: List[Tuple[float, float, int, int]]) -> Optional[int]:
    if c is None or (isinstance(c, float) and math.isnan(c)):
        return None
    for c_lo, c_hi, i_lo, i_hi in bps:
        if c_lo <= c <= c_hi:
            # Truncate to 1 decimal for PM2.5, integer for PM10 per EPA guidance (optional)
            return int(round((i_hi - i_lo) / (c_hi - c_lo) * (c - c_lo) + i_lo))
    return None

def aqi_pm25(c: Optional[float]) -> Optional[int]:
    return _linear_aqi(c, PM25_BREAKPOINTS)

def aqi_pm10(c: Optional[float]) -> Optional[int]:
    return _linear_aqi(c, PM10_BREAKPOINTS)

def compute_us_aqi(pm25: Optional[float], pm10: Optional[float]) -> Optional[int]:
    vals = []
    a25 = aqi_pm25(pm25)
    a10 = aqi_pm10(pm10)
    if a25 is not None:
        vals.append(a25)
    if a10 is not None:
        vals.append(a10)
    return max(vals) if vals else None

# -------------- API helpers --------------
def get_api_key() -> str:
    key = os.getenv("OPENAQ_API_KEY", "").strip()
    if not key:
        # You can paste a key here for quick testing, but ENV is recommended.
        key = ""  # <-- optional: "paste-your-key"
    if not key:
        raise SystemExit("Missing OPENAQ_API_KEY. Set environment variable or paste in the script.")
    return key

def _req(url: str, params: Dict[str, Any], api_key: str, retries: int = 3, backoff: float = 1.5) -> Dict[str, Any]:
    hdrs = {"X-API-Key": api_key}
    for attempt in range(retries):
        r = requests.get(url, params=params, headers=hdrs, timeout=60)
        if r.status_code == 429:
            # rate-limited: backoff
            wait = backoff ** (attempt + 1)
            time.sleep(wait)
            continue
        r.raise_for_status()
        return r.json()
    # one last try
    r = requests.get(url, params=params, headers=hdrs, timeout=60)
    r.raise_for_status()
    return r.json()

def paginate(url: str, params: Dict[str, Any], api_key: str) -> Iterable[Dict[str, Any]]:
    page = 1
    while True:
        local = params.copy()
        local["page"] = page
        data = _req(url, local, api_key)
        results = data.get("results") or []
        if not results:
            break
        for item in results:
            yield item
        meta = data.get("meta", {})
        found = meta.get("found")
        limit = meta.get("limit", local.get("limit", 100))
        if isinstance(found, int) and page * limit >= found:
            break
        page += 1

# -------------- Data collection --------------
def get_locations_for_country(iso: str, api_key: str) -> List[Dict[str, Any]]:
    params = {"iso": iso, "limit": 100}
    url = f"{BASE_URL}/locations"
    return list(paginate(url, params, api_key))

def extract_pm_sensors_by_city(locations: List[Dict[str, Any]]) -> Dict[str, Dict[str, List[int]]]:
    """
    Returns a mapping:
      city -> {'pm25': [sensor_ids...], 'pm10': [sensor_ids...]}
    """
    by_city = {}
    for loc in locations:
        city = (loc.get("locality") or loc.get("name") or "").strip() or "Unknown"
        for s in loc.get("sensors", []) or []:
            pname = (s.get("parameter", {}) or {}).get("name")
            if pname in ("pm25", "pm10"):
                by_city.setdefault(city, {"pm25": [], "pm10": []})
                by_city[city][pname].append(s["id"])
    # drop cities with neither
    return {c: d for c, d in by_city.items() if d["pm25"] or d["pm10"]}

def fetch_sensor_hours(sensor_id: int, dt_from: str, dt_to: str, api_key: str) -> pd.DataFrame:
    url = f"{BASE_URL}/sensors/{sensor_id}/measurements/hourly"
    params = {"datetime_from": dt_from, "datetime_to": dt_to, "limit": 1000}
    data = _req(url, params, api_key)
    rows = []
    for r in data.get("results", []):
        # Use the starting timestamp of the hour in UTC
        period = r.get("period") or {}
        dt = ((period.get("datetimeFrom") or {}).get("utc")) or None
        val = r.get("value")
        param = (r.get("parameter") or {}).get("name")
        if dt and param in ("pm25", "pm10"):
            rows.append({"datetime_utc": dt, "parameter": param, "value": val})
    return pd.DataFrame(rows)

def collect_country_last_month(iso: str, api_key: str, max_workers: int = 16) -> pd.DataFrame:
    # date range: last 30 days from now (UTC)
    dt_to = datetime.now(timezone.utc)
    dt_from = dt_to - timedelta(days=30)
    dt_from_s = dt_from.strftime("%Y-%m-%dT%H:%M:%SZ")
    dt_to_s = dt_to.strftime("%Y-%m-%dT%H:%M:%SZ")

    locations = get_locations_for_country(iso, api_key)
    city_sensors = extract_pm_sensors_by_city(locations)

    # schedule all sensor/hour fetches
    jobs = []
    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        for city, d in city_sensors.items():
            for pname in ("pm25", "pm10"):
                for sid in d[pname]:
                    jobs.append((city, pname, sid, ex.submit(fetch_sensor_hours, sid, dt_from_s, dt_to_s, api_key)))

        records = []
        for city, pname, sid, fut in tqdm(jobs, desc="Downloading sensors", unit="sensor"):
            try:
                df = fut.result()
                if not df.empty:
                    df["city"] = city
                    records.append(df)
            except Exception as e:
                # Skip failing sensors but log
                print(f"[WARN] Sensor {sid} failed: {e}", file=sys.stderr)

    if not records:
        return pd.DataFrame(columns=["country_iso","city","datetime_utc","pm25","pm10","aqi_us"])

    raw = pd.concat(records, ignore_index=True)
    # pivot to columns pm25, pm10; average across sensors per city-hour
    raw["datetime_utc"] = pd.to_datetime(raw["datetime_utc"], utc=True)
    pivot = (raw
             .groupby(["city", "datetime_utc", "parameter"])["value"]
             .mean()
             .reset_index()
             .pivot_table(index=["city", "datetime_utc"], columns="parameter", values="value")
             .reset_index())

    # Ensure both columns exist
    if "pm25" not in pivot.columns: pivot["pm25"] = pd.NA
    if "pm10" not in pivot.columns: pivot["pm10"] = pd.NA

    # Compute AQI
    pivot["aqi_us"] = pivot.apply(lambda r: compute_us_aqi(
        float(r["pm25"]) if pd.notna(r["pm25"]) else None,
        float(r["pm10"]) if pd.notna(r["pm10"]) else None,
    ), axis=1)

    pivot["country_iso"] = iso
    # Order columns
    pivot = pivot[["country_iso","city","datetime_utc","pm25","pm10","aqi_us"]]
    pivot = pivot.sort_values(["city","datetime_utc"]).reset_index(drop=True)
    return pivot

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--iso", default="IN", help="ISO 3166-1 alpha-2 country code, e.g., IN, US, CN")
    ap.add_argument("--out", default=None, help="Output CSV path")
    ap.add_argument("--workers", type=int, default=16, help="Parallel workers")
    args = ap.parse_args()

    api_key = get_api_key()
    df = collect_country_last_month(args.iso.upper(), api_key, max_workers=args.workers)

    iso = args.iso.upper()
    out = args.out or f"air_quality_last_month_{iso}.csv"
    df.to_csv(out, index=False)
    print(f"Saved: {out} ({len(df):,} rows)")

if __name__ == "__main__":
    main()
