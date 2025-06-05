package com.example.Backend_CitizenSpeak.config;

import com.example.Backend_CitizenSpeak.services.TokenService;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import javax.crypto.SecretKey;
import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final TokenService tokenService;

    public SecurityConfig(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean() {
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(corsFilter());
        bean.setOrder(0);
        return bean;
    }

    @Bean
    @Order(1)
    public SecurityFilterChain publicAuthFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher(
                        "/api/auth/login",
                        "/api/auth/signup",
                        "/api/auth/mobile-login",
                        "/api/auth/verify-otp",
                        "/api/auth/verify-backup-code",
                        "/api/auth/generate-backup-codes",
                        "/api/public/**",
                        "/api/password/**",
                        "/api/test",
                        "/test",
                        "/",
                        "/actuator/**"
                )
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain authenticatedAuthFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher(
                        "/api/auth/me",
                        "/api/auth/profile/**",
                        "/api/auth/change-password"
                )
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }


    @Bean
    @Order(3)
    public SecurityFilterChain mediaFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/media/**")
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    @Order(4)
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/**")
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKey key = tokenService.getKey();
        return NimbusJwtDecoder.withSecretKey(key).build();
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        corsConfiguration.setAllowCredentials(true);

        corsConfiguration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://10.1.4.*:*",
                "http://10.1.33.*:*",
                "http://192.168.*.*:*",
                "https://localhost:*",
                "capacitor://localhost",
                "ionic://localhost",
                "exp://*:*"
        ));

        corsConfiguration.setAllowedHeaders(Arrays.asList("*"));

        corsConfiguration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
        ));

        corsConfiguration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"
        ));

        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsFilter(source);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}