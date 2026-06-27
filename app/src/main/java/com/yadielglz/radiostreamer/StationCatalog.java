package com.yadielglz.radiostreamer;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

final class StationCatalog {
    private StationCatalog() {
    }

    static List<Station> all() {
        return Collections.unmodifiableList(Arrays.asList(
                new Station("WKAQ 580", "https://i.iheart.com/v3/re/assets/images/77d5680e-688b-4488-8c56-9b4963cb0813.png", "https://tunein.cdnstream1.com/4851_128.mp3", "AM 580", "WKAQ AM", "News and talk", "San Juan, PR"),
                new Station("NOTIUNO 630", "https://www.unoradio.com/logos/logos/notiuno/notiuno630.png", "https://server20.servistreaming.com:9022/stream", "AM 630", "WUNO AM", "NotiUno 630", "San Juan, PR"),
                new Station("Radio Once", "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png", "http://49.13.212.200:14167/stream?type=http&nocache=21", "AM 1120", "WMSW AM", "Radio Once", "Hatillo, PR"),
                new Station("Radio Isla", "https://radioIsla.tv/wp-content/uploads/2019/06/Logo-Radio-Isla.png", "https://server7.servistreaming.com/proxy/radioisla?mp=%2Fstream%3Ftype%3D.mp3&_=1", "AM 1320", "WSKN AM", "Radio Isla", "San Juan, PR"),
                new Station("Radio Tiempo", "https://radiotiempo.net/wp-content/uploads/2022/08/tiempo-172x128.png", "https://server7.servistreaming.com/proxy/tiempo?mp=%2Fstream%3Ftype%3D.mp3&_=1", "AM 1430", "WNLE AM", "Radio Tiempo", "Caguas, PR"),
                new Station("Radio Cumbre", "https://i.ibb.co/5g2402Cc/wkum-png.png", "https://sp.unoredcdn.net/8158/stream/1/", "AM 1470", "WKUM AM", "Radio Cumbre", "Orocovis, PR"),
                new Station("Radio Oro", "https://cdn-profiles.tunein.com/s21791/images/logod.png?t=637238626060000000", "https://streams.proftsc.com/listen/woro/woro.mp3", "FM 92.5", "WORO FM", "Radio Oro", "Corozal, PR"),
                new Station("Z 93", "https://i.ibb.co/23BMsKBY/wznt-png.png", "https://liveaudio.lamusica.com/PR_WZNT_icy", "FM 93.7", "WZNT FM", "La Emisora Nacional", "San Juan"),
                new Station("La Nueva 94", "https://i.ibb.co/sv1RBc08/wodalogo.png", "https://liveaudio.lamusica.com/PR_WODA_icy", "FM 94.7", "WODA FM", "Los #1 En Joda", "San Juan"),
                new Station("Fidelity", "https://fidelitypr.com/wp-content/uploads/2022/01/cropped-Redisen%CC%83o-Logo-Fidelity-3-15-2048x677.png", "https://server7.servistreaming.com/proxy/fidelity?mp=%2Fstream%3Ftype%3D.mp3&_=1", "FM 95.7", "WFID FM", "Tu Vida En Musica", "Rio Piedras"),
                new Station("Estereotempo", "https://i.ibb.co/F4GM0W81/wrxr.png", "https://liveaudio.lamusica.com/PR_WRXD_icy", "FM 96.5", "WRXD FM", "Estereotempo", "San Juan"),
                new Station("Magic 97.3", "https://i.ibb.co/Z6WqXPzV/woye.png", "https://stream.eleden.com:8210/magic.aac", "FM 97.3", "WOYE FM", "Magic 97.3", "Rio Grande"),
                new Station("SalSoul", "https://salsoul.com/wp-content/uploads/2020/12/cropped-salsoul-2.png", "https://server20.servistreaming.com:9023/stream?type=.mp3&_=1", "FM 99.1", "WPRM FM", "SalSoul", "San Juan"),
                new Station("La X", "https://i.ibb.co/zWDcRnBw/laxpng.png", "http://stream.eleden.com:8235/lax.ogg", "FM 100.7", "WXYX FM", "La X", "Bayamon"),
                new Station("Hot102", "https://hot102pr.com/wp-content/uploads/2023/10/Artboard-4.png", "https://server7.servistreaming.com/proxy/hot?mp=%2Fstream%3Ftype%3D.mp3&_=1", "FM 102.5", "WTOK FM", "HOT 102", "San Juan"),
                new Station("KQ105", "https://upload.wikimedia.org/wikipedia/en/8/80/KQ_105_WKAQ-FM_2014_logo.png", "https://televicentro.streamguys1.com/wkaqfm-icy?key=e018260d508e5b04e91a4d9a30f7ceea9b71bd86e2bfdb6fcc3bbd4928525c00", "FM 104.7", "WKAQ FM", "La Primera", "San Juan"),
                new Station("La Mega 106.9", "https://i.ibb.co/Xrp2nhpQ/WMEG-PNG.png", "https://liveaudio.lamusica.com/PR_WMEG_icy", "FM 106.9", "WMEG FM", "La Mega 106.9", "San Juan"),
                new Station("Latino 99", "https://mm.aiircdn.com/371/5928f28889f51.png", "https://lmmradiocast.com/latino99fm", "Satellite", null, "Pura Salsa!", "Kissimmee, Florida"),
                new Station("Salseo", "https://static.wixstatic.com/media/8dfec0_3e265a2f0fb5417c90c55be4e4e7d3cf~mv2.png/v1/fill/w_276,h_120,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/LOGOSALSEORADIO_clipped_rev_2_v2%20(1).png", "https://listen.radioking.com/radio/399811/stream/452110", "Satellite", null, "Salseo Radio", "Quebradillas, Puerto Rico"),
                new Station("La Vieja Z", "https://i.ibb.co/d4VZVjj2/LVZ8-removebg-preview.png", "https://s2.free-shoutcast.com/stream/18006", "Satellite", null, "Salsa!", "Central Florida")
        ));
    }
}
