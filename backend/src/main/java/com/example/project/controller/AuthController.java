package com.example.project.controller;

import com.example.project.dto.*;
import com.example.project.repository.UserRepository;
import com.example.project.repository.EmailOtpRepository;
import com.example.project.repository.entity.EmailOtp;
import com.example.project.repository.entity.User;
import com.example.project.security.CustomUserDetails;
import com.example.project.security.JwtService;
import com.example.project.service.EmailService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${google.client.id:YOUR_GOOGLE_CLIENT_ID}")
    private String googleClientId;

    // Simple in-memory rate limiting map: Email -> Last Request Time
    private final Map<String, LocalDateTime> otpRequestRates = new ConcurrentHashMap<>();

    private boolean isRateLimited(String email) {
        LocalDateTime lastReq = otpRequestRates.get(email);
        if (lastReq != null && lastReq.plusMinutes(1).isAfter(LocalDateTime.now())) {
            return true; // Must wait 1 minute between requests
        }
        otpRequestRates.put(email, LocalDateTime.now());
        return false;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already in use"));
        }

        if (isRateLimited(email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "Please wait 1 minute before requesting another OTP"));
        }

        String plainOtp = String.format("%06d", new java.util.Random().nextInt(999999));

        try {
            emailService.sendOtpEmail(email, plainOtp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to send OTP email: " + e.getMessage()));
        }

        String hashedOtp = passwordEncoder.encode(plainOtp);

        Optional<EmailOtp> existingOpt = emailOtpRepository.findByEmail(email);
        EmailOtp emailOtp;
        if (existingOpt.isPresent()) {
            emailOtp = existingOpt.get();
            emailOtp.setOtp(hashedOtp);
            emailOtp.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        } else {
            emailOtp = EmailOtp.builder()
                    .email(email)
                    .otp(hashedOtp)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .build();
        }
        emailOtpRepository.save(emailOtp);

        return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already in use"));
        }

        if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
        }

        Optional<EmailOtp> otpOpt = emailOtpRepository.findByEmail(request.getEmail());
        if (otpOpt.isEmpty() || !passwordEncoder.matches(request.getOtp(), otpOpt.get().getOtp())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
        }

        if (otpOpt.get().getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired"));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .provider("LOCAL")
                .role("ROLE_USER")
                .emailVerified(true)
                .build();
        userRepository.save(user);

        emailOtpRepository.delete(otpOpt.get());

        return ResponseEntity.ok(Map.of("message", "User registered successfully. You can now login."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        if (!userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "User with this email does not exist"));
        }

        if (isRateLimited(email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "Please wait 1 minute before requesting another OTP"));
        }

        String plainOtp = String.format("%06d", new java.util.Random().nextInt(999999));

        try {
            emailService.sendOtpEmail(email, plainOtp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to send reset email: " + e.getMessage()));
        }

        String hashedOtp = passwordEncoder.encode(plainOtp);

        Optional<EmailOtp> existingOpt = emailOtpRepository.findByEmail(email);
        EmailOtp emailOtp;
        if (existingOpt.isPresent()) {
            emailOtp = existingOpt.get();
            emailOtp.setOtp(hashedOtp);
            emailOtp.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        } else {
            emailOtp = EmailOtp.builder()
                    .email(email)
                    .otp(hashedOtp)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .build();
        }
        emailOtpRepository.save(emailOtp);

        return ResponseEntity.ok(Map.of("message", "Password reset OTP sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");

        if (email == null || otp == null || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email, OTP, and new password are required"));
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters long"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        Optional<EmailOtp> otpOpt = emailOtpRepository.findByEmail(email);
        if (otpOpt.isEmpty() || !passwordEncoder.matches(otp, otpOpt.get().getOtp())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
        }

        if (otpOpt.get().getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP has expired"));
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        emailOtpRepository.delete(otpOpt.get());

        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully. You can now login."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Please verify your email address before logging in"));
        }

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        return ResponseEntity.ok(buildAuthResponse(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        Long userId = jwtService.getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid refresh token"));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
        }

        return ResponseEntity.ok(buildAuthResponse(userOpt.get()));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                Optional<User> userOpt = userRepository.findByEmail(email);
                User user;
                if (userOpt.isPresent()) {
                    user = userOpt.get();
                    if (!user.getProvider().equals("GOOGLE")) {
                        user.setEmailVerified(true);
                        userRepository.save(user);
                    }
                } else {
                    user = User.builder()
                            .name(name)
                            .email(email)
                            .password(null)
                            .provider("GOOGLE")
                            .role("ROLE_USER")
                            .emailVerified(true)
                            .build();
                    userRepository.save(user);
                }

                return ResponseEntity.ok(buildAuthResponse(user));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid ID token."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Google auth failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(AuthResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .build());
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getId());

        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .build();

        return new AuthResponse(accessToken, refreshToken, userDto);
    }
}
