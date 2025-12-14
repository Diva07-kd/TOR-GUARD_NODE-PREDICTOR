from fastapi import APIRouter, HTTPException
import requests
from datetime import datetime
from typing import Dict, Any

router = APIRouter()

@router.get("/tor_network_status")
async def get_tor_network_status() -> Dict[str, Any]:
    """Query live TOR network via Onionoo API"""
    try:
        response = requests.get(
            "https://onionoo.torproject.org/details",
            params={'running': 'true', 'fields': 'nickname,flags'},
            headers={'Accept-Encoding': 'gzip'},
            timeout=15
        )
        response.raise_for_status()
        data = response.json()
        
        relays = data.get('relays', [])
        guards = sum(1 for r in relays if 'Guard' in r.get('flags', []))
        exits = sum(1 for r in relays if 'Exit' in r.get('flags', []))
        
        return {
            'status': 'ONLINE',
            'total_relays': len(relays),
            'total_guards': guards,
            'total_exits': exits,
            'last_updated': datetime.now().isoformat(),
            'source': 'onionoo.torproject.org'
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
