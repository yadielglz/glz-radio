package com.glztech.radiostream;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

final class StationCatalog {
    private StationCatalog() {
    }

    static List<Station> all() {
        return Collections.unmodifiableList(Arrays.asList(
                new Station("WKAQ 580", "https://bloximages.chicago2.vip.townnews.com/wkaq580.com/content/tncms/custom/image/9732c65a-a5bb-11ee-8102-67d137cd6b72.png?resize=400%2C167", "https://televicentro.streamguys1.com/wkaqqam-icy?key=ae6a3b84b2caabf9d96d28dc1d8e3ebc2cc0ecce9ef074936108cb8cccf7964d&source=tunein&source=TuneIn&gdpr=0&us_privacy=1YNY&bundle=tunein.com&lat=28.0699&long=-81.8107", "AM 580", "WKAQ AM", "News and talk", "San Juan, PR"),
                new Station("NOTIUNO 630", "https://i.iheart.com/v3/catalog/live/8542?ops=ratio%281%2C1%29%2Cscale%28164%2C0%29&cacheable=true", "https://server20.servistreaming.com:9022/stream", "AM 630", "WUNO AM", "NotiUno 630", "San Juan, PR"),
                new Station("Radio Once", "https://cdn-radiotime-logos.tunein.com/s21253d.png", "http://whsh4u-panel.com:14167/stream", "AM 1120", "WMSW AM", "Radio Once", "Hatillo, PR"),
                new Station("Radio Isla", "https://cdn-profiles.tunein.com/s22835/images/logod.png?t=637003437830000000", "https://server7.servistreaming.com/proxy/RadioIsla?mp=%2Fstream%3Ftype%3D.mp3&_=1", "AM 1320", "WSKN AM", "Radio Isla", "San Juan, PR"),
                new Station("Radio Tiempo", "https://www.nicepng.com/png/detail/264-2646242_radio-tiempo-png-radio-tiempo-logo.png", "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1", "AM 1430", "WNLE AM", "Radio Tiempo", "Caguas, PR"),
                new Station("Radio Cumbre", "https://i.ibb.co/5g2402Cc/wkum-png.png", "https://sp.unoredcdn.net/8158/stream/1/", "AM 1470", "WKUM AM", "Radio Cumbre", "Orocovis, PR"),
                new Station("Radio Oro", "https://i.ibb.co/nqbSmS1M/worofm-processed.png", "https://us2.internet-radio.com/proxy/woro?mp=/stream", "FM 92.5", "WORO FM", "Radio Oro", "Corozal, PR"),
                new Station("Z 93", "https://i.ibb.co/23BMsKBY/wznt-png.png", "https://liveaudio.lamusica.com/PR_WZNT_icy", "FM 93.7", "WZNT FM", "La Emisora Nacional", "San Juan"),
                new Station("La Nueva 94", "https://i.ibb.co/sv1RBc08/wodalogo.png", "https://liveaudio.lamusica.com/PR_WODA_icy", "FM 94.7", "WODA FM", "Los #1 En Joda", "San Juan"),
                new Station("Fidelity", "https://fidelitypr.com/wp-content/uploads/2025/09/cropped-Untitled-design-45.png", "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1", "FM 95.7", "WFID FM", "Tu Vida En Musica", "Rio Piedras"),
                new Station("Estereotempo", "https://i.ibb.co/F4GM0W81/wrxr.png", "https://liveaudio.lamusica.com/PR_WRXD_icy", "FM 96.5", "WRXD FM", "Estereotempo", "San Juan"),
                new Station("Magic 97.3", "https://i.ibb.co/Z6WqXPzV/woye.png", "https://a4.asurahosting.com:6760/radio.mp3", "FM 97.3", "WOYE FM", "Magic 97.3", "Rio Grande"),
                new Station("SalSoul", "https://i.iheart.com/v3/catalog/live/8544?ops=ratio%281%2C1%29%2Cscale%28164%2C0%29&cacheable=true", "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1", "FM 99.1", "WPRM FM", "SalSoul", "San Juan"),
                new Station("La X", "https://i.ibb.co/zWDcRnBw/laxpng.png", "https://stream.eleden.com:8230/La X.aac", "FM 100.7", "WXYX FM", "La X", "Bayamon"),
                new Station("Hot102", "https://cdn-profiles.tunein.com/s29490/images/logod.png?t=638986500070000000", "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1", "FM 102.5", "WTOK FM", "HOT 102", "San Juan"),
                new Station("KQ105", "https://i.iheart.com/v3/catalog/live/5177?ops=ratio%281%2C1%29%2Cscale%28164%2C0%29&cacheable=true", "https://televicentro.streamguys1.com/wkaqfm-icy?key=ae6a3b84b2caabf9d96d28dc1d8e3ebc2cc0ecce9ef074936108cb8cccf7964d&source=tunein&source=TuneIn&gdpr=0&us_privacy=1YNY&bundle=tunein.com&lat=28.0699&long=-81.8107", "FM 104.7", "WKAQ FM", "La Primera", "San Juan"),
                new Station("La Mega 106.9", "https://i.ibb.co/Xrp2nhpQ/WMEG-PNG.png", "https://liveaudio.lamusica.com/PR_WMEG_icy", "FM 106.9", "WMEG FM", "La Mega 106.9", "San Juan"),
                new Station("Latino 99", "https://mm.aiircdn.com/371/5928f28889f51.png", "https://lmmradiocast.com/Latino99fm?_=68068", "Satellite", null, "Pura Salsa!", "Kissimmee, Florida"),
                new Station("Salseo", "https://cdn-profiles.tunein.com/s201197/images/logod.png?t=639088402270000000", "https://listen.radioking.com/radio/399811/stream/452110", "Satellite", null, "Salseo Radio", "Quebradillas, Puerto Rico"),
                new Station("La Vieja Z", "https://i.ibb.co/d4VZVjj2/LVZ8-removebg-preview.png", "https://s2.free-shoutcast.com/stream/18006", "Satellite", null, "Salsa!", "Central Florida")
        ));
    }
}
