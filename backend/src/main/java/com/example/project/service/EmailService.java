package com.example.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String mailUsername;

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "FinVibe - Your Verification Code";
        String body = "Welcome to FinVibe!\n\nYour 6-digit verification code is: " + otp + "\n\nThis code will expire in 15 minutes.";

        if (mailUsername == null || mailUsername.trim().isEmpty()) {
            throw new RuntimeException("Email configuration is missing (mailUsername).");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom(mailUsername);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP to " + toEmail + ": " + e.getMessage());
        }
    }
}
