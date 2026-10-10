package com.evcharging.ev_charging_backend.service;

import com.evcharging.ev_charging_backend.dto.BatteryLifeResponse;
import com.evcharging.ev_charging_backend.exception.ResourceNotFoundException;
import com.evcharging.ev_charging_backend.model.ChargingSession;
import com.evcharging.ev_charging_backend.model.Role;
import com.evcharging.ev_charging_backend.model.User;
import com.evcharging.ev_charging_backend.model.Vehicle;
import com.evcharging.ev_charging_backend.repository.ChargingSessionRepository;
import com.evcharging.ev_charging_backend.repository.UserRepository;
import com.evcharging.ev_charging_backend.repository.VehicleRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class BatteryLifeService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ChargingSessionRepository chargingSessionRepository;

    public BatteryLifeService(UserRepository userRepository,
                             VehicleRepository vehicleRepository,
                             ChargingSessionRepository chargingSessionRepository) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.chargingSessionRepository = chargingSessionRepository;
    }

    public BatteryLifeResponse getUserBatteryLife(String userId, Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + authentication.getName()));

        if (!currentUser.getRole().equals(Role.ADMIN) && !currentUser.getId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to view this user's battery life data.");
        }

        Vehicle primaryVehicle = vehicleRepository.findByUserId(userId).stream()
                .findFirst()
                .orElse(null);

        List<ChargingSession> sessions = chargingSessionRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(ChargingSession::getActualStartTime, Comparator.nullsLast(LocalDateTime::compareTo)).reversed())
                .toList();

        BatteryLifeResponse response = new BatteryLifeResponse();
        response.setUserId(userId);

        Double currentSoc = primaryVehicle != null && primaryVehicle.getCurrentBatteryPercentage() != null
                ? clamp(primaryVehicle.getCurrentBatteryPercentage(), 0.0, 100.0)
                : null;

        response.setCurrentBatterySoc(currentSoc);
        if (currentSoc != null) {
            double rangeBase = primaryVehicle.getBatteryCapacity() != null && primaryVehicle.getBatteryCapacity() > 0
                    ? primaryVehicle.getBatteryCapacity() * 10.0
                    : 350.0;
            response.setEstimatedRangeKm((double) Math.round((currentSoc / 100.0) * rangeBase));
            response.setCurrentUsableCapacityKwh(primaryVehicle.getBatteryCapacity() != null ? primaryVehicle.getBatteryCapacity() * (currentSoc / 100.0) : null);
            response.setEstimatedCapacityKwh(primaryVehicle.getBatteryCapacity() != null ? primaryVehicle.getBatteryCapacity() : null);
        }

        int fastSessionCount = 0;
        for (ChargingSession session : sessions) {
            if (session.getActualStartTime() == null || session.getActualEndTime() == null) {
                continue;
            }
            long durationMinutes = Duration.between(session.getActualStartTime(), session.getActualEndTime()).toMinutes();
            if (session.getEnergyConsumedKwh() != null && durationMinutes > 0 && session.getEnergyConsumedKwh() >= 12 && durationMinutes <= 45) {
                fastSessionCount++;
            }
        }

        double derivedHealth = 100.0;
        if (!sessions.isEmpty()) {
            derivedHealth -= fastSessionCount * 3.0;
            if (currentSoc != null && currentSoc > 90) {
                derivedHealth -= 5.0;
            }
            if (currentSoc != null && currentSoc < 20) {
                derivedHealth -= 8.0;
            }
        }

        if (sessions.isEmpty() && currentSoc == null) {
            response.setBatteryHealthPercent(null);
            response.setBatteryHealthStatus("Awaiting telemetry");
            response.setBatteryLifeScore(null);
            response.setBatteryLifeStatus("Awaiting telemetry");
        } else {
            double clampedHealth = clamp(derivedHealth, 60.0, 100.0);
            response.setBatteryHealthPercent(clampedHealth);
            response.setBatteryHealthStatus(getHealthStatus(clampedHealth));

            int score = (int) Math.round(clampedHealth - fastSessionCount * 1.5);
            if (currentSoc != null) {
                score = (int) Math.round(score + (currentSoc / 10.0) - 5.0);
            }
            score = clampInt(score, 0, 100);
            response.setBatteryLifeScore(score);
            response.setBatteryLifeStatus(getHealthStatus(score));
        }

        if (currentSoc != null) {
            if (currentSoc < 20) {
                response.setRecommendation("Battery level is low. Consider charging soon.");
            } else if (currentSoc <= 80) {
                response.setRecommendation("Battery is in the recommended daily operating range.");
            } else {
                response.setRecommendation("Battery is highly charged. Avoid keeping the vehicle at high SOC for long periods.");
            }
            if (fastSessionCount > 0) {
                response.getInsights().add("Frequent fast charging detected. Normal charging may help reduce battery stress.");
            }
            if (currentSoc > 90) {
                response.getInsights().add("Your battery is often charged above 90%.");
            }
            if (response.getInsights().isEmpty()) {
                response.getInsights().add("Your recent charging pattern is healthy.");
            }
        } else {
            response.setRecommendation("Battery telemetry is not yet available. Once vehicle or charging data is present, this summary will provide a tailored recommendation.");
            response.getInsights().add("Battery telemetry is not available yet.");
        }

        BatteryLifeResponse.BatteryStatistics statistics = new BatteryLifeResponse.BatteryStatistics();
        statistics.setTotalSessions(sessions.size());
        statistics.setFastChargingSessions(fastSessionCount);
        statistics.setNormalSessions(Math.max(0, sessions.size() - fastSessionCount));
        statistics.setDeepDischargeEvents(0L);

        double totalEnergy = 0.0;
        double totalDuration = 0.0;
        for (ChargingSession session : sessions) {
            if (session.getEnergyConsumedKwh() != null) {
                totalEnergy += session.getEnergyConsumedKwh();
            }
            if (session.getActualStartTime() != null && session.getActualEndTime() != null) {
                totalDuration += Duration.between(session.getActualStartTime(), session.getActualEndTime()).toMinutes();
            }
        }
        statistics.setTotalEnergyConsumedKwh(totalEnergy);
        statistics.setAverageEnergyPerSessionKwh(sessions.isEmpty() ? 0.0 : totalEnergy / sessions.size());
        statistics.setAverageChargingDurationMinutes(sessions.isEmpty() ? 0.0 : totalDuration / sessions.size());
        response.setStatistics(statistics);

        List<BatteryLifeResponse.ChargingHistoryEntry> history = new ArrayList<>();
        for (ChargingSession session : sessions) {
            Double startSoc = null;
            Double endSoc = null;
            if (session.getEnergyConsumedKwh() != null && session.getActualStartTime() != null && session.getActualEndTime() != null && session.getEnergyConsumedKwh() > 0) {
                Long durationMinutes = Duration.between(session.getActualStartTime(), session.getActualEndTime()).toMinutes();
                history.add(new BatteryLifeResponse.ChargingHistoryEntry(
                        session.getActualStartTime().format(DateTimeFormatter.ISO_LOCAL_DATE),
                        session.getStationId(),
                        startSoc,
                        endSoc,
                        session.getEnergyConsumedKwh(),
                        determineChargingType(session),
                        durationMinutes
                ));
            }
        }
        response.setChargingHistory(history);

        return response;
    }

    private String determineChargingType(ChargingSession session) {
        if (session.getActualStartTime() == null || session.getActualEndTime() == null || session.getEnergyConsumedKwh() == null) {
            return "NORMAL";
        }
        long durationMinutes = Duration.between(session.getActualStartTime(), session.getActualEndTime()).toMinutes();
        if (session.getEnergyConsumedKwh() >= 12 && durationMinutes <= 45) {
            return "FAST";
        }
        return "NORMAL";
    }

    private String getHealthStatus(double value) {
        if (value >= 90) return "Excellent";
        if (value >= 80) return "Good";
        if (value >= 70) return "Fair";
        return "Needs Attention";
    }

    private String getHealthStatus(int value) {
        if (value >= 90) return "Excellent";
        if (value >= 80) return "Good";
        if (value >= 70) return "Fair";
        return "Needs Attention";
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private int clampInt(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
