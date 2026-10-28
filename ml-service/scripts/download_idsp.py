import os
import sys
import argparse
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import hashlib
import time

BASE_URL = "https://ncdc.mohfw.gov.in/uploads/weekly_outbreaks/"

def compute_sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def list_pdfs(year: int):
    url = urljoin(BASE_URL, f"{year}/")
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    links = [a.get("href") for a in soup.find_all("a", href=True) if a["href"].lower().endswith('.pdf')]
    return [urljoin(url, href) for href in links]

def download_pdf(pdf_url: str, dest_dir: str):
    os.makedirs(dest_dir, exist_ok=True)
    filename = os.path.basename(pdf_url)
    dest_path = os.path.join(dest_dir, filename)
    if os.path.exists(dest_path):
        print(f"[skip] {filename} already exists")
        return dest_path
    print(f"[download] {pdf_url}")
    with requests.get(pdf_url, stream=True, timeout=30) as r:
        r.raise_for_status()
        with open(dest_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
    return dest_path

def main():
    parser = argparse.ArgumentParser(description="Download NCDC weekly outbreak PDFs for given years")
    parser.add_argument("--years", nargs="+", type=int, required=True, help="One or more years to download, e.g. 2023 2024")
    parser.add_argument("--limit", type=int, default=None, help="Maximum number of PDFs per year (for pilot runs)")
    args = parser.parse_args()

    raw_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/raw"))
    manifest_path = os.path.join(raw_dir, "download_manifest.csv")
    os.makedirs(raw_dir, exist_ok=True)
    with open(manifest_path, "w") as manifest:
        manifest.write("year,filename,sha256,downloaded_at\n")
        for year in args.years:
            pdf_links = list_pdfs(year)
            if args.limit:
                pdf_links = pdf_links[:args.limit]
            for pdf_url in pdf_links:
                dest = download_pdf(pdf_url, raw_dir)
                sha = compute_sha256(dest)
                manifest.write(f"{year},{os.path.basename(dest)},{sha},{time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                time.sleep(1.5)  # gentle rate‑limit

if __name__ == "__main__":
    main()
