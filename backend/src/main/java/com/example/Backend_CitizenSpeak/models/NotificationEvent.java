package com.example.Backend_CitizenSpeak.models;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class NotificationEvent extends ApplicationEvent {
    private final Notification notification;

    public NotificationEvent(Notification notification) {
        super(notification);
        this.notification = notification;
    }

}