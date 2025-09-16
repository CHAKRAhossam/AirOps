package com.example.reporting_service.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Optional;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor authorizationHeaderForwardingInterceptor() {
        return template -> {
            // Forward Authorization header if present in the current request
            Optional.ofNullable(org.springframework.web.context.request.RequestContextHolder.getRequestAttributes())
                    .filter(org.springframework.web.context.request.ServletRequestAttributes.class::isInstance)
                    .map(org.springframework.web.context.request.ServletRequestAttributes.class::cast)
                    .map(org.springframework.web.context.request.ServletRequestAttributes::getRequest)
                    .map(req -> req.getHeader("Authorization"))
                    .ifPresent(token -> template.header("Authorization", token));
        };
    }
}




