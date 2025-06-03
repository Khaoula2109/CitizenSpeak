package com.example.Backend_CitizenSpeak.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Votre code OTP");
        message.setText("Bonjour,\n\nVotre code OTP est : " + otp + "\n\nIl est valable 5 minutes.");
        mailSender.send(message);
    }
}
