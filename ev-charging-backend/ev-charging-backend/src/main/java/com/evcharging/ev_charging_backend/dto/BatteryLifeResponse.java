package com.evcharging.ev_charging_backend.dto;

import java.util.ArrayList;
import java.util.List;

public class BatteryLifeResponse {

    private String userId;
    private Double currentBatterySoc;
    private Double estimatedRangeKm;
    private Double batteryHealthPercent;
    private String batteryHealthStatus;
    private Integer batteryLifeScore;
    private String batteryLifeStatus;
    private String recommendation;
    private List<String> insights = new ArrayList<>();
    private Double estimatedCapacityKwh;
    private Double currentUsableCapacityKwh;
    private List<BatteryTrendPoint> batteryHealthTrend = new ArrayList<>();
    private BatteryStatistics statistics = new BatteryStatistics();
    private List<ChargingHistoryEntry> chargingHistory = new ArrayList<>();

    public static class BatteryTrendPoint {
        private String label;
        private Double value;

        public BatteryTrendPoint() {
        }

        public BatteryTrendPoint(String label, Double value) {
            this.label = label;
            this.value = value;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public Double getValue() {
            return value;
        }

        public void setValue(Double value) {
            this.value = value;
        }
    }

    public static class BatteryStatistics {
        private long totalSessions;
        private long normalSessions;
        private long fastChargingSessions;
        private double totalEnergyConsumedKwh;
        private double averageEnergyPerSessionKwh;
        private double averageChargingDurationMinutes;
        private long deepDischargeEvents;

        public long getTotalSessions() {
            return totalSessions;
        }

        public void setTotalSessions(long totalSessions) {
            this.totalSessions = totalSessions;
        }

        public long getNormalSessions() {
            return normalSessions;
        }

        public void setNormalSessions(long normalSessions) {
            this.normalSessions = normalSessions;
        }

        public long getFastChargingSessions() {
            return fastChargingSessions;
        }

        public void setFastChargingSessions(long fastChargingSessions) {
            this.fastChargingSessions = fastChargingSessions;
        }

        public double getTotalEnergyConsumedKwh() {
            return totalEnergyConsumedKwh;
        }

        public void setTotalEnergyConsumedKwh(double totalEnergyConsumedKwh) {
            this.totalEnergyConsumedKwh = totalEnergyConsumedKwh;
        }

        public double getAverageEnergyPerSessionKwh() {
            return averageEnergyPerSessionKwh;
        }

        public void setAverageEnergyPerSessionKwh(double averageEnergyPerSessionKwh) {
            this.averageEnergyPerSessionKwh = averageEnergyPerSessionKwh;
        }

        public double getAverageChargingDurationMinutes() {
            return averageChargingDurationMinutes;
        }

        public void setAverageChargingDurationMinutes(double averageChargingDurationMinutes) {
            this.averageChargingDurationMinutes = averageChargingDurationMinutes;
        }

        public long getDeepDischargeEvents() {
            return deepDischargeEvents;
        }

        public void setDeepDischargeEvents(long deepDischargeEvents) {
            this.deepDischargeEvents = deepDischargeEvents;
        }
    }

    public static class ChargingHistoryEntry {
        private String date;
        private String chargingStationId;
        private Double startSoc;
        private Double endSoc;
        private Double energyConsumedKwh;
        private String chargingType;
        private Long durationMinutes;

        public ChargingHistoryEntry() {
        }

        public ChargingHistoryEntry(String date, String chargingStationId, Double startSoc, Double endSoc,
                                   Double energyConsumedKwh, String chargingType, Long durationMinutes) {
            this.date = date;
            this.chargingStationId = chargingStationId;
            this.startSoc = startSoc;
            this.endSoc = endSoc;
            this.energyConsumedKwh = energyConsumedKwh;
            this.chargingType = chargingType;
            this.durationMinutes = durationMinutes;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getChargingStationId() {
            return chargingStationId;
        }

        public void setChargingStationId(String chargingStationId) {
            this.chargingStationId = chargingStationId;
        }

        public Double getStartSoc() {
            return startSoc;
        }

        public void setStartSoc(Double startSoc) {
            this.startSoc = startSoc;
        }

        public Double getEndSoc() {
            return endSoc;
        }

        public void setEndSoc(Double endSoc) {
            this.endSoc = endSoc;
        }

        public Double getEnergyConsumedKwh() {
            return energyConsumedKwh;
        }

        public void setEnergyConsumedKwh(Double energyConsumedKwh) {
            this.energyConsumedKwh = energyConsumedKwh;
        }

        public String getChargingType() {
            return chargingType;
        }

        public void setChargingType(String chargingType) {
            this.chargingType = chargingType;
        }

        public Long getDurationMinutes() {
            return durationMinutes;
        }

        public void setDurationMinutes(Long durationMinutes) {
            this.durationMinutes = durationMinutes;
        }
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Double getCurrentBatterySoc() {
        return currentBatterySoc;
    }

    public void setCurrentBatterySoc(Double currentBatterySoc) {
        this.currentBatterySoc = currentBatterySoc;
    }

    public Double getEstimatedRangeKm() {
        return estimatedRangeKm;
    }

    public void setEstimatedRangeKm(Double estimatedRangeKm) {
        this.estimatedRangeKm = estimatedRangeKm;
    }

    public Double getBatteryHealthPercent() {
        return batteryHealthPercent;
    }

    public void setBatteryHealthPercent(Double batteryHealthPercent) {
        this.batteryHealthPercent = batteryHealthPercent;
    }

    public String getBatteryHealthStatus() {
        return batteryHealthStatus;
    }

    public void setBatteryHealthStatus(String batteryHealthStatus) {
        this.batteryHealthStatus = batteryHealthStatus;
    }

    public Integer getBatteryLifeScore() {
        return batteryLifeScore;
    }

    public void setBatteryLifeScore(Integer batteryLifeScore) {
        this.batteryLifeScore = batteryLifeScore;
    }

    public String getBatteryLifeStatus() {
        return batteryLifeStatus;
    }

    public void setBatteryLifeStatus(String batteryLifeStatus) {
        this.batteryLifeStatus = batteryLifeStatus;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public List<String> getInsights() {
        return insights;
    }

    public void setInsights(List<String> insights) {
        this.insights = insights;
    }

    public Double getEstimatedCapacityKwh() {
        return estimatedCapacityKwh;
    }

    public void setEstimatedCapacityKwh(Double estimatedCapacityKwh) {
        this.estimatedCapacityKwh = estimatedCapacityKwh;
    }

    public Double getCurrentUsableCapacityKwh() {
        return currentUsableCapacityKwh;
    }

    public void setCurrentUsableCapacityKwh(Double currentUsableCapacityKwh) {
        this.currentUsableCapacityKwh = currentUsableCapacityKwh;
    }

    public List<BatteryTrendPoint> getBatteryHealthTrend() {
        return batteryHealthTrend;
    }

    public void setBatteryHealthTrend(List<BatteryTrendPoint> batteryHealthTrend) {
        this.batteryHealthTrend = batteryHealthTrend;
    }

    public BatteryStatistics getStatistics() {
        return statistics;
    }

    public void setStatistics(BatteryStatistics statistics) {
        this.statistics = statistics;
    }

    public List<ChargingHistoryEntry> getChargingHistory() {
        return chargingHistory;
    }

    public void setChargingHistory(List<ChargingHistoryEntry> chargingHistory) {
        this.chargingHistory = chargingHistory;
    }
}
