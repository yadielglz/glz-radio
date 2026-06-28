package com.glztech.radiostream;

final class Station {
    final String name;
    final String logoUrl;
    final String streamUrl;
    final String frequency;
    final String callSign;
    final String tagline;
    final String location;

    Station(
            String name,
            String logoUrl,
            String streamUrl,
            String frequency,
            String callSign,
            String tagline,
            String location
    ) {
        this.name = name;
        this.logoUrl = logoUrl;
        this.streamUrl = streamUrl;
        this.frequency = frequency;
        this.callSign = callSign;
        this.tagline = tagline;
        this.location = location;
    }

    String band() {
        if (frequency == null) {
            return "Live";
        }
        if (frequency.startsWith("AM")) {
            return "AM";
        }
        if (frequency.startsWith("FM")) {
            return "FM";
        }
        return "Satellite";
    }

    String meta() {
        StringBuilder builder = new StringBuilder(frequency == null ? "Live" : frequency);
        if (callSign != null && !callSign.trim().isEmpty()) {
            builder.append(" / ").append(callSign);
        }
        return builder.toString();
    }

    boolean matches(String query) {
        if (query == null || query.trim().isEmpty()) {
            return true;
        }
        String haystack = (name + " " + frequency + " " + callSign + " " + tagline + " " + location).toLowerCase();
        return haystack.contains(query.trim().toLowerCase());
    }
}
