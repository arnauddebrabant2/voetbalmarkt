import requests
import json

API_KEY = "26b980767661a7c93cc7229fc9126e28"

url = "https://v3.football.api-sports.io/teams"
headers = {
    "x-apisports-key": API_KEY
}

params = {
    "country": "Belgium"
}

print("🏗️ Bezig met ophalen van Belgische ploegen...")

response = requests.get(url, headers=headers, params=params)
data = response.json()

if "response" not in data or not data["response"]:
    print("❌ Geen teams gevonden of fout:", data)
    exit()

teams = []

for item in data["response"]:
    team_info = item.get("team", {})
    name = team_info.get("name")
    logo = team_info.get("logo")

    if name and logo:
        teams.append({
            "name": name,
            "logo": logo
        })

# Opslaan naar JSON-bestand
with open("belgian_teams_simple.json", "w", encoding="utf-8") as f:
    json.dump(teams, f, ensure_ascii=False, indent=2)

print(f"✅ {len(teams)} ploegen opgeslagen in belgian_teams_simple.json")
