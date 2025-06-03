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
import java.util.List;

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
    public SecurityFilterChain authFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/auth/**", "/api/public/**", "/api/password/forgot", "/api/password/reset")
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain mediaFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/media/**")
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/media/file/**").permitAll()
                        .anyRequest().authenticated()
                );
        return http.build();
    }

    @Bean
    @Order(3)
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
        corsConfiguration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:19006",
                "http://localhost:19000",
                "http://localhost:8081",
                "capacitor://localhost",
                "ionic://localhost",
                "http://localhost:8082",
                "http://10.1.33.128:8082",
                "http://10.1.4.176:8082",
                "exp://10.1.4.176:19000" ,
                "http://10.1.4.176:8082",
                "http://10.1.4.176:19000",
                "exp://10.1.4.176:19000"

        ));
        corsConfiguration.setAllowedHeaders(Arrays.asList(
                "Origin",
                "Access-Control-Allow-Origin",
                "Content-Type",
                "Accept",
                "Authorization",
                "Origin, Accept",
                "X-Requested-With",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));
        corsConfiguration.setExposedHeaders(Arrays.asList(
                "Origin",
                "Content-Type",
                "Accept",
                "Authorization",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
        ));
        corsConfiguration.setAllowedMethods(Arrays.asList(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsFilter(urlBasedCorsConfigurationSource);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}