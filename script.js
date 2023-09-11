window.addEventListener("load", async () => {
    try {
        var map = L.map('map').setView([0, 0], 3);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        map.on('click', (e) => {
            var popup = L.popup();
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(map);
        });

        const res = await fetch("https://ipapi.co/json");
        if (res.ok) {
            const data = await res.json();
            const loc = [data["latitude"], data["longitude"]];
            map.setView(loc, 3);
        }

        const response = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events");
        if (response.ok) {
            const results = await response.json();

            const title = results["title"];
            const description = results["description"];
            const link = results["link"];
            const events = results["events"];

            const table = document.createElement("table");

            const caption = document.createElement("caption");
            const a = document.createElement("a");
            a.innerHTML = title + " - " + description;
            a.href = link;
            caption.appendChild(a);

            events.forEach(e => {
                const tr = document.createElement("tr");
                const td = document.createElement("td");
                const eventLink = document.createElement("a");
                eventLink.href = e["link"]
                eventLink.innerHTML = e["title"];
                td.appendChild(eventLink);
                tr.appendChild(td);

                const categories = e["categories"];
                const td2 = document.createElement("td");
                td2.innerHTML = categories[0]["title"];
                tr.appendChild(td2);

                e["geometry"].forEach(geometry => {
                    const type = geometry["type"];
                    if (type == "Point") {
                        const coords = geometry["coordinates"];
                        L.marker([coords[1], coords[0]]).bindPopup("<a href='" + e["link"] + "'>" + e["title"] + "</a>").addTo(map);
                    }
                });

                table.appendChild(tr);
            });
            document.querySelector("#data").appendChild(table);
            // renderMap();
            await reminder(response.headers.get("X-Ratelimit-Remaining") ?? 60);
        }
    } catch (e) {
        document.writeln("Could not load site. Please refresh. If this probmlem persists, contact admin.");
    }
});

function renderMap() {
    var map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.on('click', (e) => {
        var popup = L.popup();
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
    });
}

async function reminder(limit) {
    const permission = await Notification.requestPermission();
    if (permission == "granted") {
        new Notification("NASA Api Rate Limit: " + limit, {
            tag: "rate-limit",
            body: "Your limit is " + limit + " requests",
            icon: "https://neon.tech/favicon.png",
        });
    }
}
