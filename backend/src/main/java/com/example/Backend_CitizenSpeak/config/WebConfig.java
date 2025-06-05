package com.example.Backend_CitizenSpeak.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        registry
                .addResourceHandler("/uploads/photos/**")
                .addResourceLocations("file:uploads/photos/")
                .setCachePeriod(31536000);
    }
}
