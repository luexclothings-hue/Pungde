import requests
from datetime import datetime, timedelta

def get_agroclimate_overview(lat: float, lon: float) -> dict:
    """
    Retrieves agro-climatic conditions for the past 12 months for the given location.
    """
    try:
        # Compute last 12 months
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=365)
        # Use past 12 months ending 2 months ago (to ensure data is available)
        # For monthly temporal API, format should be YYYYMMDD but let's try YYYYMM01
        end_date = datetime(2024, 9, 1)  # September 2024
        start_date = datetime(2023, 10, 1)  # October 2023
        start = start_date.strftime("%Y%m01")
        end = end_date.strftime("%Y%m01")

        # NASA POWER API - using climatology endpoint which doesn't need dates
        url = (
            f"https://power.larc.nasa.gov/api/temporal/climatology/point?"
            f"parameters=T2M,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN"
            f"&community=AG"
            f"&latitude={lat}&longitude={lon}"
            f"&format=JSON"
        )

        print(f"Testing NASA POWER API...")
        print(f"URL: {url}")
        print(f"Latitude: {lat}, Longitude: {lon}")
        print(f"Date range: {start} to {end}")
        print()

        response = requests.get(url, timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Headers: {response.headers.get('content-type')}")
        print()
        
        if response.status_code != 200:
            print(f"ERROR: API returned status code {response.status_code}")
            print(f"Response text: {response.text[:500]}")
            return {
                "status": "failed",
                "error": f"API returned status {response.status_code}",
                "notes": "Check latitude, longitude, or network connectivity."
            }

        data = response.json()
        
        print("Response structure:")
        print(f"Keys in response: {list(data.keys())}")
        
        if "properties" in data:
            print(f"Keys in properties: {list(data['properties'].keys())}")
            if "parameter" in data["properties"]:
                print(f"Parameters available: {list(data['properties']['parameter'].keys())}")
            else:
                print("ERROR: 'parameter' key not found in properties")
                print(f"Properties content: {data['properties']}")
                return {
                    "status": "failed",
                    "error": "'parameter' key not found in API response",
                    "notes": "API response structure changed."
                }
        else:
            print("ERROR: 'properties' key not found in response")
            print(f"Response content: {data}")
            return {
                "status": "failed",
                "error": "'properties' key not found in API response",
                "notes": "API response structure changed."
            }

        params = data["properties"]["parameter"]

        agro_data = {
            "temperature_C": params["T2M"],
            "rainfall_mm": params["PRECTOTCORR"],
            "humidity_percent": params["RH2M"],
            "wind_speed_mps": params["WS2M"],
            "solar_radiation_kWh_m2_day": params["ALLSKY_SFC_SW_DWN"],
        }

        print("\nSUCCESS! Data retrieved:")
        print(f"Temperature data points: {len(agro_data['temperature_C'])}")
        print(f"Sample temperature: {list(agro_data['temperature_C'].items())[:3]}")
        print(f"Rainfall data points: {len(agro_data['rainfall_mm'])}")
        print(f"Sample rainfall: {list(agro_data['rainfall_mm'].items())[:3]}")

        return {
            "status": "success",
            "location_details": {
                "latitude": lat,
                "longitude": lon,
                "start_month": start,
                "end_month": end
            },
            "agro_climate": agro_data,
            "notes": "Values represent monthly climatology for the past 12 months."
        }

    except requests.exceptions.Timeout:
        print("ERROR: Request timed out")
        return {
            "status": "failed",
            "error": "Request timed out",
            "notes": "NASA POWER API is not responding."
        }
    except requests.exceptions.ConnectionError as e:
        print(f"ERROR: Connection error - {e}")
        return {
            "status": "failed",
            "error": f"Connection error: {str(e)}",
            "notes": "Cannot connect to NASA POWER API."
        }
    except KeyError as e:
        print(f"ERROR: Key not found in response - {e}")
        return {
            "status": "failed",
            "error": f"Missing key in API response: {str(e)}",
            "notes": "API response structure is different than expected."
        }
    except Exception as e:
        print(f"ERROR: Unexpected error - {type(e).__name__}: {e}")
        return {
            "status": "failed",
            "error": str(e),
            "notes": "Check latitude, longitude, or network connectivity."
        }


if __name__ == "__main__":
    # Test with dummy coordinates
    # Majothi, Uttarakhand approximate coordinates
    test_lat = 30.0668
    test_lon = 78.2676
    
    print("=" * 60)
    print("Testing NASA POWER API with Majothi, Uttarakhand coordinates")
    print("=" * 60)
    print()
    
    result = get_agroclimate_overview(test_lat, test_lon)
    
    print("\n" + "=" * 60)
    print("FINAL RESULT:")
    print("=" * 60)
    print(f"Status: {result['status']}")
    if result['status'] == 'success':
        print(f"Location: {result['location_details']}")
        print(f"Notes: {result['notes']}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")
        print(f"Notes: {result['notes']}")
