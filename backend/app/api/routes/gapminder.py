from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import requests
import csv
from io import StringIO

from app.db.session import get_db
from app.models.gapminder_data import GapminderData

router = APIRouter()

OWNER = "open-numbers"
REPO = "ddf--gapminder--systema_globalis"
BRANCH = "master"
TARGET_DIR = "countries-etc-datapoints"


def github_get(url: str):
    return requests.get(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "GapMinders-App"
        },
        timeout=30
    )


def get_target_dir_tree():
    root_tree_url = f"https://api.github.com/repos/{OWNER}/{REPO}/git/trees/{BRANCH}"
    root_resp = github_get(root_tree_url)

    if root_resp.status_code != 200:
        return None, {
            "error": "Failed to read repo root from GitHub API",
            "status_code": root_resp.status_code
        }

    root_items = root_resp.json().get("tree", [])
    target_dir_sha = None

    for item in root_items:
        if item.get("type") == "tree" and item.get("path") == TARGET_DIR:
            target_dir_sha = item.get("sha")
            break

    if not target_dir_sha:
        return None, {"error": f"Directory '{TARGET_DIR}' not found"}

    sub_tree_url = f"https://api.github.com/repos/{OWNER}/{REPO}/git/trees/{target_dir_sha}?recursive=1"
    sub_resp = github_get(sub_tree_url)

    if sub_resp.status_code != 200:
        return None, {
            "error": "Failed to read subtree from GitHub API",
            "status_code": sub_resp.status_code
        }

    return sub_resp.json().get("tree", []), None


def build_full_path(filename: str, tree_items: list[dict]) -> str | None:
    for item in tree_items:
        if item.get("type") == "blob" and item.get("path", "").endswith(filename):
            return f"{TARGET_DIR}/{item['path']}"
    return None


def get_download_url(full_path: str):
    contents_url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{full_path}?ref={BRANCH}"
    resp = github_get(contents_url)

    if resp.status_code != 200:
        return None, {
            "error": "Failed to fetch file metadata from GitHub Contents API",
            "status_code": resp.status_code,
            "path": full_path
        }

    data = resp.json()
    return data.get("download_url"), None


def infer_indicator_code(filename: str) -> str:
    prefix = "ddf--datapoints--"
    suffix = "--by--geo--time.csv"

    if filename.startswith(prefix) and filename.endswith(suffix):
        return filename[len(prefix):-len(suffix)]

    return filename.replace(".csv", "")


@router.get("/datasets")
def list_datasets(limit: int = 50):
    tree_items, err = get_target_dir_tree()
    if err:
        return err

    files = [
        item["path"]
        for item in tree_items
        if item.get("type") == "blob" and item.get("path", "").endswith(".csv")
    ]

    files.sort()
    return {
        "count": len(files),
        "datasets": files[:limit]
    }


@router.post("/import")
def import_gapminder_data(
    filename: str = Query(..., description="Exact CSV filename from /gapminder/datasets"),
    db: Session = Depends(get_db)
):
    tree_items, err = get_target_dir_tree()
    if err:
        return err

    full_path = build_full_path(filename, tree_items)
    if not full_path:
        return {"error": "Dataset file not found in Gapminder repo", "filename": filename}

    download_url, err = get_download_url(full_path)
    if err:
        return err

    if not download_url:
        return {"error": "No download_url returned by GitHub API", "path": full_path}

    resp = requests.get(download_url, timeout=60)
    if resp.status_code != 200:
        return {
            "error": "Failed to download dataset file",
            "status_code": resp.status_code,
            "path": full_path
        }

    reader = csv.DictReader(StringIO(resp.text))
    indicator_code = infer_indicator_code(filename)

    saved = 0
    skipped = 0
    sample_columns = reader.fieldnames

    try:
        for row in reader:
            country_code = row.get("geo")
            year_raw = row.get("time")
            value_raw = row.get(indicator_code)

            if not country_code or not year_raw or value_raw in (None, ""):
                skipped += 1
                continue

            year = int(year_raw)
            value = float(value_raw)

            exists = db.query(GapminderData).filter(
                GapminderData.country_code == country_code,
                GapminderData.indicator_code == indicator_code,
                GapminderData.year == year
            ).first()

            if exists:
                skipped += 1
                continue

            record = GapminderData(
                country=country_code,
                country_code=country_code,
                indicator=indicator_code.replace("_", " "),
                indicator_code=indicator_code,
                year=year,
                value=value
            )

            db.add(record)
            saved += 1

        db.commit()

        return {
            "message": "Gapminder dataset imported through GitHub API",
            "filename": filename,
            "path_used": full_path,
            "indicator_code": indicator_code,
            "rows_saved": saved,
            "rows_skipped": skipped,
            "columns": sample_columns
        }

    except Exception as e:
        db.rollback()
        return {
            "error": str(e),
            "filename": filename,
            "path_used": full_path,
            "indicator_code": indicator_code,
            "columns": sample_columns
        }


@router.get("/data")
def get_data(
    indicator_code: str = Query(...),
    country_code: str | None = Query(None),
    limit: int = Query(100),
    db: Session = Depends(get_db)
):
    query = db.query(GapminderData).filter(
        GapminderData.indicator_code == indicator_code
    )

    if country_code:
        query = query.filter(GapminderData.country_code == country_code)

    rows = query.order_by(GapminderData.year.asc()).limit(limit).all()

    return [
        {
            "country": r.country_code,
            "year": r.year,
            "value": r.value,
            "indicator_code": r.indicator_code
        }
        for r in rows
    ]


@router.get("/countries")
def get_countries(
    indicator_code: str = Query(...),
    year: int | None = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(GapminderData.country_code).filter(
        GapminderData.indicator_code == indicator_code
    )

    if year is not None:
        query = query.filter(GapminderData.year == year)

    rows = (
        query.distinct()
        .order_by(GapminderData.country_code.asc())
        .all()
    )

    return [row[0] for row in rows]


@router.get("/years")
def get_years(
    indicator_code: str = Query(...),
    db: Session = Depends(get_db)
):
    rows = (
        db.query(GapminderData.year)
        .filter(GapminderData.indicator_code == indicator_code)
        .distinct()
        .order_by(GapminderData.year.asc())
        .all()
    )

    return [row[0] for row in rows]


@router.get("/compare")
def compare_countries(
    indicator_code: str = Query(...),
    year: int = Query(...),
    country_codes: str = Query(..., description="Comma-separated list like abw,usa,can"),
    db: Session = Depends(get_db)
):
    codes = [code.strip().lower() for code in country_codes.split(",") if code.strip()]

    rows = (
        db.query(GapminderData)
        .filter(
            GapminderData.indicator_code == indicator_code,
            GapminderData.year == year,
            GapminderData.country_code.in_(codes)
        )
        .order_by(GapminderData.country_code.asc())
        .all()
    )

    return [
        {
            "country": r.country_code,
            "year": r.year,
            "value": r.value,
            "indicator_code": r.indicator_code
        }
        for r in rows
    ]