package com.backend.sporta.service.ai;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class InMemoryCache {

    private final ConcurrentHashMap<String, Object> cache = new ConcurrentHashMap<>();
    private final ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();

    public void put(String key, Object value, long ttl, TimeUnit unit) {
        cache.put(key, value);
        executor.schedule(() -> {
            cache.remove(key);
        }, ttl, unit);
    }

    public Object get(String key) {
        return cache.get(key);
    }

    public void remove(String key) {
        cache.remove(key);
    }

    // Returns the incremented value, 1 if newly created
    public Long increment(String key, long ttl, TimeUnit unit) {
        Long newValue = (Long) cache.compute(key, (k, v) -> {
            if (v == null) return 1L;
            return ((Long) v) + 1L;
        });

        // If it's 1, it's a new entry, schedule deletion
        if (newValue != null && newValue == 1L) {
            executor.schedule(() -> cache.remove(key), ttl, unit);
        }
        
        return newValue;
    }
}
