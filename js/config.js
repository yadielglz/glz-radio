// Radio Stations Configuration (DO NOT ALTER - Curated List)
const RADIO_STATIONS = {
    "WKAQ 580": {
        "logo": "https://i.iheart.com/v3/re/assets/images/77d5680e-688b-4488-8c56-9b4963cb0813.png",
        "streamUrl": "https://tunein.cdnstream1.com/4851_128.mp3",
        "frequency": "AM: 580 Khz",
        "callSign": "WKAQ AM",
        "rdsText": ["WKAQ 580", "WKAQ AM", "580 AM", "San Juan, PR"]
    },
    "NOTIUNO 630": {
        "logo": "https://www.unoradio.com/logos/logos/notiuno/notiuno630.png",
        "streamUrl": "https://server20.servistreaming.com:9022/stream",
        "frequency": "AM: 630 Khz",
        "callSign": "WUNO AM",
        "rdsText": ["NotiUno 630", "WUNO AM", "630 AM", "San Juan, PR"]
    },
    "Radio Once": {
        "logo": "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        "streamUrl": "http://49.13.212.200:14167/stream?type=http&nocache=21",
        "frequency": "AM: 1120 Khz",
        "callSign": "WMSW AM",
        "rdsText": ["Radio Once", "WMSW AM", "1120 AM", "Hatillo, PR"]
    },
    "Radio Isla": {
        "logo": "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "frequency": "AM: 1320 Khz",
        "callSign": "WSKN AM",
        "rdsText": ["Radio Isla", "WSKN AM", "1320 AM", "San Juan, PR"]
    },
    "Radio Tiempo": {
        "logo": "https://radiotiempo.net/wp-content/uploads/2022/08/tiempo-172x128.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "frequency": "AM: 1430 Khz",
        "callSign": "WNLE AM",
        "rdsText": ["Radio Tiempo", "WNLE AM", "1430 AM", "Caguas, PR"]
    },
    "Radio Cumbre": {
        "logo": "https://i.ibb.co/5g2402Cc/wkum-png.png",
        "streamUrl": "https://sp.unoredcdn.net/8158/stream/1/",
        "frequency": "AM: 1470 Khz",
        "callSign": "WKUM AM",
        "rdsText": ["Radio Cumbre", "WKUM AM", "1470 AM", "Orocovis, PR"]
    },
    "Radio Oro": {
        "logo": "https://cdn-profiles.tunein.com/s21791/images/logod.png?t=637238626060000000",
        "streamUrl": "https://us2.internet-radio.com/proxy/woro?mp=/stream",
        "frequency": "FM: 92.5 Mhz",
        "callSign": "WORO FM",
        "rdsText": ["Radio Oro", "WORO FM", "92.5 FM", "Corozal, PR"]
    },
    "Z 93": {
        "logo": "https://i.ibb.co/23BMsKBY/wznt-png.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WZNT_icy",
        "frequency": "FM: 93.7 Mhz",
        "callSign": "WZNT FM",
        "rdsText": ["Z 93", "La Emisora", "Nacional", "De La Salsa", "WZNT FM", "93.7 FM", "San Juan", "Puerto Rico"]
    },
    "La Nueva 94": {
        "logo": "https://i.ibb.co/sv1RBc08/wodalogo.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WODA_icy",
        "frequency": "FM: 94.7 Mhz",
        "callSign": "WODA FM",
        "rdsText": ["La Nueva 94", "Los #1", "En Joda", "WODA FM", "94.7 FM", "San Juan", "Puerto Rico"]
    },
    "Fidelity": {
        "logo": "https://fidelitypr.com/wp-content/uploads/2022/01/cropped-Redisen%CC%83o-Logo-Fidelity-3-15-2048x677.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "frequency": "FM: 95.7 Mhz",
        "callSign": "WFID FM",
        "rdsText": ["Fidelity", "Tu Vida", "En Música", "WFID FM", "95.7 FM", "Rio Piedras", "Puerto Rico"]
    },
    "Estereotempo": {
        "logo": "https://i.ibb.co/F4GM0W81/wrxr.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WRXD_icy",
        "frequency": "FM: 96.5 Mhz",
        "callSign": "WRXD FM",
        "rdsText": ["Estereotempo", "WRXD FM", "96.5 FM", "San Juan", "Puerto Rico"]
    },
    "Magic 97.3": {
        "logo": "https://i.ibb.co/Z6WqXPzV/woye.png",
        "streamUrl": "https://stream.eleden.com:8210/magic.aac",
        "frequency": "FM: 97.3 Mhz",
        "callSign": "WOYE FM",
        "rdsText": ["Magic 97.3", "WOYE FM", "97.3 FM", "Rio Grande", "Puerto Rico"]
    },
    "SalSoul": {
        "logo": "https://salsoul.com/wp-content/uploads/2020/12/cropped-salsoul-2.png",
        "streamUrl": "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1",
        "frequency": "FM: 99.1 Mhz",
        "callSign": "WPRM FM",
        "rdsText": ["SalSoul", "WPRM FM", "99.1 FM", "San Juan", "Puerto Rico"]
    },
    "La X": {
        "logo": "https://i.ibb.co/zWDcRnBw/laxpng.png",
        "streamUrl": "http://stream.eleden.com:8235/lax.ogg",
        "frequency": "FM: 100.7 Mhz",
        "callSign": "WXYX FM",
        "rdsText": ["La X", "Para", "Los Que Llevan", "La Musica", "Por Dentro", "WXYX FM", "100.7 FM", "Bayamón", "Puerto Rico"]
    },
    "Hot102": {
        "logo": "https://hot102pr.com/wp-content/uploads/2023/10/Artboard-4.png",
        "streamUrl": "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1",
        "frequency": "FM: 102.5 Mhz",
        "callSign": "WTOK FM",
        "rdsText": ["HOT 102", "WTOK FM", "102.5 FM", "San Juan", "Puerto Rico"]
    },
    "KQ105": {
        "logo": "https://upload.wikimedia.org/wikipedia/en/8/80/KQ_105_WKAQ-FM_2014_logo.png",
        "streamUrl": "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00",
        "frequency": "FM: 104.7 Mhz",
        "callSign": "WKAQ FM",
        "rdsText": ["KQ 105", "La Primera", "WKAQ FM", "104.7 FM", "San Juan", "Puerto Rico"]
    },
    "La Mega 106.9": {
        "logo": "https://i.ibb.co/Xrp2nhpQ/WMEG-PNG.png",
        "streamUrl": "https://liveaudio.lamusica.com/PR_WMEG_icy",
        "frequency": "FM: 106.9 Mhz",
        "callSign": "WMEG FM",
        "rdsText": ["La Mega 106.9", "WMEG FM", "106.9 FM", "San Juan", "Puerto Rico"]
    },
    "Latino 99": {
        "logo": "https://mm.aiircdn.com/371/5928f28889f51.png",
        "streamUrl": "https://lmmradiocast.com/latino99fm",
        "frequency": "Satellite Radio",
        "callSign": null,
        "rdsText": ["Latino 99", "¡Pura", "Salsa!", "Kissimmee,", "Florida"]
    },
    "Salseo": {
        "logo": "https://static.wixstatic.com/media/8dfec0_3e265a2f0fb5417c90c55be4e4e7d3cf~mv2.png/v1/fill/w_276,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/LOGOSALSEORADIO_clipped_rev_2_v2%20(1).png",
        "streamUrl": "https://listen.radioking.com/radio/399811/stream/452110",
        "frequency": "Satellite Radio",
        "callSign": null,
        "rdsText": ["Salseo Radio", "Ponte Al", "Día En", "La Salsa!", "Quebradillas", "Puerto Rico"]
    },
    "La Vieja Z": {
        "logo": "https://i.ibb.co/d4VZVjj2/LVZ8-removebg-preview.png",
        "streamUrl": "https://s3.free-shoutcast.com/stream/18094",
        "frequency": "Satellite Radio",
        "callSign": null,
        "rdsText": ["La Vieja Z", "Central Florida", "Salsa!"]
    }
};

// App Constants
const STATIONS_ORDER = Object.keys(RADIO_STATIONS);
const APP_VERSION = "10.0";
const APP_BUILD_DATE = "2025-07-30";

// Update intervals
const RDS_ROTATION_INTERVAL = 4000; // 4 seconds
const CLOCK_UPDATE_INTERVAL = 1000; // 1 second

export const STATIONS = Object.keys(RADIO_STATIONS).map(stationName => {
    return {
        name: stationName,
        ...RADIO_STATIONS[stationName]
    };
});