import anthropic
import base64
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from geopy.geocoders import Nominatim

# Load environment variables
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# Get API key
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("ANTHROPIC_API_KEY not found in .env or environment")

# Initialize Claude client
client = anthropic.Anthropic(api_key=api_key)


def encode_image_to_base64(file_path: str) -> str:
    with open(file_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def geocode_location(location: str) -> tuple[float, float] | None:
    geolocator = Nominatim(user_agent="missing-person-locator")
    try:
        loc = geolocator.geocode(location)
        if loc:
            return loc.latitude, loc.longitude
    except Exception:
        pass
    return None


def extract_with_claude(image_path: str) -> dict:
    base64_image = encode_image_to_base64(image_path)

    prompt = """Extract the following fields from the image and return a JSON object:

{
  "first_name": string,
  "last_name": string or null,
  "age": integer,
  "height": float (in feet) or null,
  "weight": float (in pounds) or null,
  "lat": float (initially 0.0),
  "lon": float (initially 0.0),
  "missing_since": date (YYYY-MM-DD),
  "description": string,
  "locations_mentioned": array of strings (place names extracted from description),
  "reward": float or null,
  "phone_number": string
}

Only use the data visible in the image. Do not guess. Use null or empty arrays if a value isn't present.

The `locations_mentioned` field should include any geographic locations mentioned in the description text, such as cities, states, landmarks, or streets.
"""

    message = client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=2000,
        temperature=0.7,
        system=prompt,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": base64_image,
                        },
                    }
                ],
            }
        ],
    )

    response_text = message.content[0].text.strip()

    # Clean markdown-style code block if present
    if response_text.startswith("```json"):
        response_text = response_text.replace("```json", "").strip("`").strip()
    elif response_text.startswith("```"):
        response_text = response_text.strip("`").strip()

    try:
        data = json.loads(response_text)
    except json.JSONDecodeError:
        print("Claude's response was not valid JSON:")
        print(response_text)
        return {}

    # Use the first geocodable location
    for loc in data.get("locations_mentioned", []):
        coords = geocode_location(loc)
        if coords:
            data["lat"], data["lon"] = coords
            print(f"📍 Found location '{loc}' → ({coords[0]}, {coords[1]})")
            break
    else:
        print("⚠️  No valid location found in description.")

    return data


# Run the extraction
if __name__ == "__main__":
    result = extract_with_claude("example.png")
    print(json.dumps(result, indent=2))
