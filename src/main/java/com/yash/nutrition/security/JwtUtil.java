package com.yash.nutrition.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretString;

    @Value("${jwt.expiration.ms:3600000}")
    private long jwtExpirationInMs;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        if (secretString == null || secretString.isBlank()) {
            throw new IllegalStateException("JWT_SECRET environment variable is not set. Application cannot start securely.");
        }
        byte[] keyBytes = Decoders.BASE64.decode(secretString);
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // ── Extraction ───────────────────────────────────────────────────────────

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        // jjwt 0.12.x API
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ── Generation ───────────────────────────────────────────────────────────

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        if (userDetails.getAuthorities() != null && !userDetails.getAuthorities().isEmpty()) {
            extraClaims.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        }
        return createToken(extraClaims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> extraClaims, String subject) {
        // jjwt 0.12.x fluent builder (no deprecated set* methods)
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
                .signWith(secretKey)
                .compact();
    }

    // ── Validation ───────────────────────────────────────────────────────────

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}
